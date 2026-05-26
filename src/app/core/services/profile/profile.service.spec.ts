import { vi, describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@angular/core';
import { ProfileService } from './profile.service';
import { AuthService } from '../auth/auth.service';
import { Preferences } from '@capacitor/preferences';
import { setDoc, runTransaction } from 'firebase/firestore';

// Mock dependencies
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn().mockReturnValue({})
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn().mockReturnValue({}),
  setDoc: vi.fn().mockResolvedValue(undefined),
  runTransaction: vi.fn(),
  onSnapshot: vi.fn().mockReturnValue(() => {})
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn().mockReturnValue({}),
  uploadBytes: vi.fn().mockResolvedValue({}),
  getDownloadURL: vi.fn().mockResolvedValue('https://mockphoto.com/avatar.jpg')
}));

const mockAuthService = {
  userSignal: signal<any>({ uid: 'test_uid', displayName: 'Test User', photoURL: null })
};

// Mock @angular/core inject and effect
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    inject: (token: any) => {
      if (token === AuthService) {
        return mockAuthService;
      }
      return null;
    },
    effect: (cb: () => any) => {
      cb();
      return { destroy: () => {} };
    }
  };
});

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate being online by default in navigator
    vi.stubGlobal('navigator', { onLine: true });
    service = new ProfileService();
  });

  it('should initialize with default profile', () => {
    expect(service.profileSignal()).toBeNull();
  });

  describe('updateProfile', () => {
    it('should update local signal and cache immediately', async () => {
      // Setup active session mock
      const mockProfile = {
        uid: 'test_uid',
        profile: {
          firstName: '',
          lastName: '',
          nickname: 'test_user',
          avatarId: '/images/default-avatar.png',
          avatarColor: '#06b6d4',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        progression: { level: 1, xp: 0, unlockedAvatars: [], unlockedFrames: [], badges: [], cosmetics: [] },
        stats: {
          offline: { gamesPlayed: 0, gamesWon: 0, timesImpostor: 0, totalPlayTimeSecs: 0, correctVotes: 0, winStreak: 0 },
          online: { gamesPlayed: 0, gamesWon: 0, timesImpostor: 0, totalPlayTimeSecs: 0, correctVotes: 0, winStreak: 0 }
        }
      };
      service.profileSignal.set(mockProfile);

      const success = await service.updateProfile({ firstName: 'John', lastName: 'Doe' });
      
      expect(success).toBe(true);
      expect(service.profileSignal()?.profile.firstName).toBe('John');
      expect(service.profileSignal()?.profile.lastName).toBe('Doe');
      expect(Preferences.set).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalled();
    });

    it('should queue updates when offline', async () => {
      // Simulate being offline
      vi.stubGlobal('navigator', { onLine: false });

      const mockProfile = {
        uid: 'test_uid',
        profile: {
          firstName: '',
          lastName: '',
          nickname: 'test_user',
          avatarId: '/images/default-avatar.png',
          avatarColor: '#06b6d4',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        progression: { level: 1, xp: 0, unlockedAvatars: [], unlockedFrames: [], badges: [], cosmetics: [] },
        stats: {
          offline: { gamesPlayed: 0, gamesWon: 0, timesImpostor: 0, totalPlayTimeSecs: 0, correctVotes: 0, winStreak: 0 },
          online: { gamesPlayed: 0, gamesWon: 0, timesImpostor: 0, totalPlayTimeSecs: 0, correctVotes: 0, winStreak: 0 }
        }
      };
      service.profileSignal.set(mockProfile);

      const success = await service.updateProfile({ firstName: 'OfflineName' });
      
      expect(success).toBe(false);
      expect(service.profileSignal()?.profile.firstName).toBe('OfflineName');
      expect(setDoc).not.toHaveBeenCalled(); // Should not call Firestore while offline
      expect(Preferences.set).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'impostor_pending_profile_test_uid' })
      );
    });
  });

  describe('changeNickname', () => {
    it('should validate nickname format', async () => {
      service.profileSignal.set({ uid: 'test_uid' } as any);
      
      const tooShort = await service.changeNickname('ab');
      expect(tooShort.success).toBe(false);
      expect(tooShort.error).toBe('INVALID_CHARACTERS');

      const invalidChars = await service.changeNickname('invalid-char!');
      expect(invalidChars.success).toBe(false);
      expect(invalidChars.error).toBe('INVALID_CHARACTERS');
    });

    it('should trigger Firestore transaction for nickname reservation', async () => {
      service.profileSignal.set({
        uid: 'test_uid',
        profile: { nickname: 'old_nick' }
      } as any);

      vi.mocked(runTransaction).mockResolvedValue({ success: true });

      const result = await service.changeNickname('new_nick');
      expect(result.success).toBe(true);
      expect(runTransaction).toHaveBeenCalled();
    });
  });
});
