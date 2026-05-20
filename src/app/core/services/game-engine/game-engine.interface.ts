import { Signal } from '@angular/core';

export interface Player {
  id: number | string;
  name: string;
  photoUrl?: string;
  isImpostor: boolean;
  isDetective?: boolean;
  hasSeenRole: boolean;
  isEliminated?: boolean;
  isHost?: boolean;
  status?: 'active' | 'away';
}

export interface GameSettings {
  playerData: { id?: number | string; name: string; photoUrl?: string }[];
  words: { word: string; hint: string; fakeWord?: string }[];
  numImpostors: number;
  numDetectives: number;
  modeId: string;
  gameTypeId: 'word' | 'question' | 'draw';
  duration?: string;
  hints?: string;
  drawTurnTime?: number;
}

export interface IGameEngine {
  players: Signal<Player[]>;
  secretWord: Signal<{ word: string; hint: string; fakeWord?: string } | null>;
  currentPlayerIndex: Signal<number>;
  gameStarted: Signal<boolean>;
  currentSettings: Signal<GameSettings | null>;
  startingPlayerId: Signal<number | string | null>;
  eliminationsCount: Signal<number>;
  drawings: Signal<string[]>;

  currentPlayer: Signal<Player | null>;
  isRevealPhaseFinished: Signal<boolean>;
  alivePlayers: Signal<Player[]>;
  currentHint: Signal<string | null>;

  startGame(settings: GameSettings): void;
  nextPlayer(): void;
  eliminatePlayer(playerId: number | string): void;
  resetGame(): void;
  addDrawing(drawing: string): void;
}
