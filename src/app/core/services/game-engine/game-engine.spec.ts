import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { LocalGameEngineService } from './local-game-engine.service';
import { RemoteGameEngineService } from './remote-game-engine.service';
import { GameSettings } from './game-engine.interface';
import { SocketService } from '../socket/socket.service';

// Mock de SocketService
const mockSocketService = {
  roomState: signal<any>(null),
  rolePayload: signal<any>(null),
  syncSettings: vi.fn(),
  startGame: vi.fn(),
  seeRole: vi.fn(),
  eliminatePlayer: vi.fn(),
  resetGame: vi.fn()
};

// Mock de @angular/core para simular inject() y effect()
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    inject: (token: any) => {
      if (token === SocketService) {
        return mockSocketService;
      }
      return null;
    },
    effect: (cb: () => any) => {
      // Ejecutar inmediatamente para simular la primera corrida del efecto reactivo
      cb();
      return {
        destroy: () => {}
      };
    }
  };
});

describe('LocalGameEngineService', () => {
  let service: LocalGameEngineService;

  beforeEach(() => {
    service = new LocalGameEngineService();
  });

  it('should initialize with correct default state', () => {
    expect(service.players()).toEqual([]);
    expect(service.secretWord()).toBeNull();
    expect(service.currentPlayerIndex()).toBe(0);
    expect(service.gameStarted()).toBe(false);
    expect(service.currentSettings()).toBeNull();
    expect(service.startingPlayerId()).toBeNull();
    expect(service.eliminationsCount()).toBe(0);
    expect(service.currentPlayer()).toBeNull();
    expect(service.isRevealPhaseFinished()).toBe(false);
  });

  describe('startGame', () => {
    const mockSettings: GameSettings = {
      playerData: [
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
        { name: 'Diana' }
      ],
      words: [
        { word: 'Apple', hint: 'Fruit', fakeWord: 'Banana' }
      ],
      numImpostors: 1,
      numDetectives: 1,
      modeId: 'normal',
      gameTypeId: 'word',
      hints: 'all'
    };

    it('should throw an error if player count is less than 3', () => {
      const invalidSettings: GameSettings = {
        ...mockSettings,
        playerData: [{ name: 'Alice' }, { name: 'Bob' }]
      };
      expect(() => service.startGame(invalidSettings)).toThrow('At least 3 players required');
    });

    it('should throw an error if word list is empty', () => {
      const invalidSettings: GameSettings = {
        ...mockSettings,
        words: []
      };
      expect(() => service.startGame(invalidSettings)).toThrow('Word list cannot be empty');
    });

    it('should initialize state and assign roles correctly', () => {
      service.startGame(mockSettings);

      expect(service.gameStarted()).toBe(true);
      expect(service.players().length).toBe(4);
      expect(service.secretWord()).toEqual(mockSettings.words[0]);
      expect(service.currentPlayerIndex()).toBe(0);
      expect(service.eliminationsCount()).toBe(0);

      // Verify that exactly 1 impostor and 1 detective were assigned
      const players = service.players();
      const impostors = players.filter(p => p.isImpostor);
      const detectives = players.filter(p => p.isDetective);

      expect(impostors.length).toBe(1);
      expect(detectives.length).toBe(1);
      expect(service.startingPlayerId()).not.toBeNull();
    });
  });

  describe('game play lifecycle', () => {
    const settings: GameSettings = {
      playerData: [
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' }
      ],
      words: [
        { word: 'Apple', hint: 'Fruit' }
      ],
      numImpostors: 1,
      numDetectives: 0,
      modeId: 'normal',
      gameTypeId: 'word',
      hints: 'all'
    };

    beforeEach(() => {
      service.startGame(settings);
    });

    it('should advance to next player when nextPlayer() is called', () => {
      expect(service.currentPlayerIndex()).toBe(0);
      expect(service.players()[0].hasSeenRole).toBe(false);

      service.nextPlayer();
      expect(service.currentPlayerIndex()).toBe(1);
      expect(service.players()[0].hasSeenRole).toBe(true);

      service.nextPlayer();
      expect(service.currentPlayerIndex()).toBe(2);
      expect(service.players()[1].hasSeenRole).toBe(true);

      service.nextPlayer();
      expect(service.currentPlayerIndex()).toBe(3);
      expect(service.players()[2].hasSeenRole).toBe(true);
      expect(service.isRevealPhaseFinished()).toBe(true);
    });

    it('should correctly eliminate players', () => {
      const firstPlayerId = service.players()[0].id;
      service.eliminatePlayer(firstPlayerId);

      expect(service.players()[0].isEliminated).toBe(true);
      expect(service.eliminationsCount()).toBe(1);
      expect(service.alivePlayers().length).toBe(2);
    });

    it('should reset game state to defaults when resetGame() is called', () => {
      service.resetGame();

      expect(service.players()).toEqual([]);
      expect(service.secretWord()).toBeNull();
      expect(service.currentPlayerIndex()).toBe(0);
      expect(service.gameStarted()).toBe(false);
      expect(service.startingPlayerId()).toBeNull();
      expect(service.eliminationsCount()).toBe(0);
    });
  });
});

describe('RemoteGameEngineService', () => {
  let service: RemoteGameEngineService;

  beforeEach(() => {
    // Reset signals and mocks
    mockSocketService.roomState.set(null);
    mockSocketService.rolePayload.set(null);
    vi.clearAllMocks();

    service = new RemoteGameEngineService();
  });

  it('should initialize with default states', () => {
    expect(service.players()).toEqual([]);
    expect(service.secretWord()).toBeNull();
    expect(service.currentPlayerIndex()).toBe(0);
    expect(service.gameStarted()).toBe(false);
    expect(service.currentSettings()).toBeNull();
    expect(service.startingPlayerId()).toBeNull();
    expect(service.eliminationsCount()).toBe(0);
    expect(service.drawings()).toEqual([]);
  });

  it('should call socketService methods correctly', () => {
    mockSocketService.roomState.set({ code: 'ABCD', settings: {} });

    // Test startGame
    const mockSettings: GameSettings = {
      playerData: [{ name: 'Alice' }],
      words: [{ word: 'Test', hint: 'Test' }],
      numImpostors: 1,
      numDetectives: 0,
      modeId: 'normal',
      gameTypeId: 'word'
    };
    service.startGame(mockSettings);
    expect(mockSocketService.syncSettings).toHaveBeenCalledWith('ABCD', mockSettings);
    expect(mockSocketService.startGame).toHaveBeenCalledWith('ABCD');

    // Test nextPlayer
    service.nextPlayer();
    expect(mockSocketService.seeRole).toHaveBeenCalledWith('ABCD');

    // Test eliminatePlayer
    service.eliminatePlayer('player1');
    expect(mockSocketService.eliminatePlayer).toHaveBeenCalledWith('ABCD', 'player1');

    // Test resetGame
    service.resetGame();
    expect(mockSocketService.resetGame).toHaveBeenCalledWith('ABCD');
  });
});
