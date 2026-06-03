import { Injectable, signal, inject, DestroyRef, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Preferences } from '@capacitor/preferences';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  runTransaction,
  onSnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { CompleteUserProfile, UserProfile, UserStats, GameStats } from '../../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private storage = getStorage(this.app);

  // Reactive signal containing the complete user profile and statistics
  public profileSignal = signal<CompleteUserProfile | null>(null);

  // Helper to update profileSignal deferred to avoid ExpressionChangedAfterItHasBeenCheckedError
  private setProfileSignal(value: CompleteUserProfile | null) {
    setTimeout(() => {
      this.profileSignal.set(value);
    });
  }

  // Offline sync queue for profile updates
  private pendingQueue: Partial<UserProfile>[] = [];
  private isSyncing = false;

  constructor() {
    // Listen to authentication changes
    effect(() => {
      const user = this.auth.userSignal();
      if (user) {
        this.initializeProfile(user.uid, user.displayName, user.photoURL);
      } else {
        this.setProfileSignal(null);
        this.pendingQueue = [];
      }
    });

    // Listen to network status online/offline events for sync queue
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.flushPendingSync();
      });
    }
  }

  /**
   * Initializes the profile: loads from local storage immediately,
   * then attaches a real-time Firestore listener to keep it updated.
   */
  private async initializeProfile(uid: string, defaultName: string | null, defaultPhoto: string | null) {
    const cacheKey = `impostor_profile_${uid}`;
    
    // 1. Load from local cache first
    try {
      const { value } = await Preferences.get({ key: cacheKey });
      if (value) {
        this.setProfileSignal(JSON.parse(value));
      }
    } catch (e) {
      console.error('Error reading local profile cache', e);
    }

    // 2. Load pending queue from local cache
    try {
      const queueKey = `impostor_pending_profile_${uid}`;
      const { value } = await Preferences.get({ key: queueKey });
      if (value) {
        this.pendingQueue = JSON.parse(value);
      }
    } catch (e) {
      console.error('Error reading pending sync queue', e);
    }

    // 3. Attach real-time Firestore snapshot listener
    const docRef = doc(this.db, `users/${uid}`);
    onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const completeProfile: CompleteUserProfile = {
          uid,
          profile: data['profile'] || this.createDefaultProfile(defaultName, defaultPhoto),
          progression: data['progression'] || this.createDefaultProgression(),
          stats: data['stats'] || this.createDefaultStats()
        };
        this.setProfileSignal(completeProfile);
        await Preferences.set({ key: cacheKey, value: JSON.stringify(completeProfile) });

        // If online, flush any pending updates that might have queued
        this.flushPendingSync();
      } else {
        // Create default profile in Firestore if it doesn't exist yet
        const defaultProfile: CompleteUserProfile = {
          uid,
          profile: this.createDefaultProfile(defaultName, defaultPhoto),
          progression: this.createDefaultProgression(),
          stats: this.createDefaultStats()
        };
        await setDoc(docRef, {
          profile: defaultProfile.profile,
          progression: defaultProfile.progression,
          stats: defaultProfile.stats
        });
        this.setProfileSignal(defaultProfile);
        await Preferences.set({ key: cacheKey, value: JSON.stringify(defaultProfile) });
      }
    }, async (error) => {
      console.error('Firestore profile sync listener error', error);
      // Fallback: If profileSignal is still null (e.g. first-time login or cache empty),
      // create a default profile so the user can still use the app offline/cached
      if (!this.profileSignal()) {
        const defaultProfile: CompleteUserProfile = {
          uid,
          profile: this.createDefaultProfile(defaultName, defaultPhoto),
          progression: this.createDefaultProgression(),
          stats: this.createDefaultStats()
        };
        this.setProfileSignal(defaultProfile);
        try {
          await Preferences.set({ key: cacheKey, value: JSON.stringify(defaultProfile) });
        } catch (e) {
          console.error('Error saving fallback profile to cache', e);
        }
      }
    });
  }

  /**
   * Updates profile data (first name, last name, nickname, color, photo URL)
   * in local cache immediately, then syncs to Firestore or queues it if offline.
   */
  async updateProfile(profileUpdates: Partial<UserProfile>): Promise<boolean> {
    const current = this.profileSignal();
    if (!current) return false;

    // Update local state immediately
    const updatedProfile: CompleteUserProfile = {
      ...current,
      profile: {
        ...current.profile,
        ...profileUpdates,
        updatedAt: new Date().toISOString()
      }
    };
    this.profileSignal.set(updatedProfile);

    // Save to local cache
    const cacheKey = `impostor_profile_${current.uid}`;
    await Preferences.set({ key: cacheKey, value: JSON.stringify(updatedProfile) });

    // Sync to network or queue
    if (navigator.onLine) {
      try {
        const docRef = doc(this.db, `users/${current.uid}`);
        await setDoc(docRef, { profile: updatedProfile.profile }, { merge: true });
        return true;
      } catch (e) {
        console.error('Error syncing profile, queuing update', e);
        this.queueUpdate(current.uid, profileUpdates);
        return false;
      }
    } else {
      this.queueUpdate(current.uid, profileUpdates);
      return false;
    }
  }

  /**
   * Reserves a unique nickname and updates the user profile atomically in a Firestore Transaction.
   * If the nickname is taken by another user, returns false.
   */
  async changeNickname(newNickname: string): Promise<{ success: boolean; error?: string }> {
    const current = this.profileSignal();
    if (!current) return { success: false, error: 'NO_ACTIVE_SESSION' };

    const uid = current.uid;
    const cleanNewNickname = newNickname.trim().toLowerCase();
    
    // Character validation
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(cleanNewNickname)) {
      return { success: false, error: 'INVALID_CHARACTERS' };
    }

    try {
      const result = await runTransaction(this.db, async (transaction) => {
        // 1. Read the nickname registration document
        const nicknameDocRef = doc(this.db, `nicknames/${cleanNewNickname}`);
        const nicknameDocSnap = await transaction.get(nicknameDocRef);

        // If nickname exists and belongs to someone else, reject
        if (nicknameDocSnap.exists() && nicknameDocSnap.data()['uid'] !== uid) {
          return { success: false, error: 'NICKNAME_TAKEN' };
        }

        // 2. Read the old nickname to release it
        const userDocRef = doc(this.db, `users/${uid}`);
        const userDocSnap = await transaction.get(userDocRef);
        const oldNickname = userDocSnap.exists()
          ? userDocSnap.data()['profile']?.nickname?.trim().toLowerCase()
          : '';

        // 3. Write new nickname reservation
        transaction.set(nicknameDocRef, { uid });

        // 4. If they had an old nickname and it changed, release it
        if (oldNickname && oldNickname !== cleanNewNickname) {
          const oldNicknameDocRef = doc(this.db, `nicknames/${oldNickname}`);
          transaction.delete(oldNicknameDocRef);
        }

        // 5. Update user profile document nickname
        const profileUpdates = {
          ...current.profile,
          nickname: newNickname,
          updatedAt: new Date().toISOString()
        };
        transaction.set(userDocRef, { profile: profileUpdates }, { merge: true });

        return { success: true };
      });

      if (result.success) {
        // Sync local cache
        const updatedProfile: CompleteUserProfile = {
          ...current,
          profile: {
            ...current.profile,
            nickname: newNickname,
            updatedAt: new Date().toISOString()
          }
        };
        this.profileSignal.set(updatedProfile);
        await Preferences.set({
          key: `impostor_profile_${uid}`,
          value: JSON.stringify(updatedProfile)
        });
      }

      return result;
    } catch (e) {
      console.error('Transaction failed: unique nickname change error', e);
      return { success: false, error: 'TRANSACTION_FAILED' };
    }
  }

  /**
   * Uploads an avatar image blob to Firebase Storage and updates the profile's avatarId/photo URL.
   */
  async uploadAvatarPhoto(blob: Blob): Promise<string | null> {
    const current = this.profileSignal();
    if (!current) return null;

    try {
      const storageRef = ref(this.storage, `users/${current.uid}/avatar.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update user profile with new photo URL
      await this.updateProfile({ avatarId: downloadURL });
      return downloadURL;
    } catch (e) {
      console.error('Error uploading avatar photo to Firebase Storage', e);
      return null;
    }
  }

  /**
   * Increments an offline statistic locally and caches it.
   */
  async incrementOfflineStat(statKey: keyof GameStats, amount: number = 1) {
    const current = this.profileSignal();
    if (!current) return;

    const stats = current.stats;
    const offlineStats = stats.offline;
    
    // Update local data
    const newOfflineStats: GameStats = {
      ...offlineStats,
      [statKey]: (offlineStats[statKey] || 0) + amount
    };

    // Calculate win streak if winning or losing
    if (statKey === 'gamesWon') {
      newOfflineStats.winStreak = (offlineStats.winStreak || 0) + amount;
    } else if (statKey === 'gamesPlayed') {
      // If played but not winning, check if we need to reset streak
      // This is basic calculation; in practice it depends on win vs lose
    }

    const updatedProfile: CompleteUserProfile = {
      ...current,
      stats: {
        ...stats,
        offline: newOfflineStats
      }
    };
    this.profileSignal.set(updatedProfile);

    // Save to local cache
    const cacheKey = `impostor_profile_${current.uid}`;
    await Preferences.set({ key: cacheKey, value: JSON.stringify(updatedProfile) });

    // Sync to Firestore if online
    if (navigator.onLine) {
      try {
        const docRef = doc(this.db, `users/${current.uid}`);
        await setDoc(docRef, { stats: updatedProfile.stats }, { merge: true });
      } catch (e) {
        console.error('Error syncing stats to Firestore', e);
      }
    }
  }

  /**
   * Queues an update in the offline sync queue.
   */
  private async queueUpdate(uid: string, updates: Partial<UserProfile>) {
    this.pendingQueue.push(updates);
    const queueKey = `impostor_pending_profile_${uid}`;
    await Preferences.set({ key: queueKey, value: JSON.stringify(this.pendingQueue) });
  }

  /**
   * Flushes the pending sync queue to Firestore.
   */
  private async flushPendingSync() {
    const current = this.profileSignal();
    if (!current || this.pendingQueue.length === 0 || this.isSyncing) return;

    this.isSyncing = true;
    const docRef = doc(this.db, `users/${current.uid}`);

    try {
      while (this.pendingQueue.length > 0) {
        const nextUpdate = this.pendingQueue[0];
        await setDoc(docRef, { profile: nextUpdate }, { merge: true });
        this.pendingQueue.shift(); // Remove from queue on success
      }
      
      // Save empty queue to Preferences
      const queueKey = `impostor_pending_profile_${current.uid}`;
      await Preferences.remove({ key: queueKey });
    } catch (e) {
      console.error('Error flushing sync queue', e);
    } finally {
      this.isSyncing = false;
    }
  }

  // --- Factory Helpers for Default Schemas ---

  private createDefaultProfile(displayName: string | null, photoURL: string | null): UserProfile {
    return {
      firstName: '',
      lastName: '',
      nickname: displayName ? displayName.replace(/\s+/g, '_') : 'guest_' + Math.floor(1000 + Math.random() * 9000),
      avatarId: photoURL || '/images/default-avatar.png',
      avatarColor: '#06b6d4', // Cyan theme default
      avatarFrame: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private createDefaultProgression() {
    return {
      level: 1,
      xp: 0,
      unlockedAvatars: [],
      unlockedFrames: [],
      badges: [],
      cosmetics: []
    };
  }

  private createDefaultStats(): UserStats {
    const defaultStats = (): GameStats => ({
      gamesPlayed: 0,
      gamesWon: 0,
      timesImpostor: 0,
      totalPlayTimeSecs: 0,
      correctVotes: 0,
      winStreak: 0
    });

    return {
      offline: defaultStats(),
      online: defaultStats()
    };
  }
}
