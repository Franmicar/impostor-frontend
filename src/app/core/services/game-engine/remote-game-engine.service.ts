import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { IGameEngine, Player, GameSettings } from './game-engine.interface';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class RemoteGameEngineService implements IGameEngine {
  private socketService = inject(SocketService);

  // Espejo local del estado remoto del servidor
  players = signal<Player[]>([]);
  secretWord = signal<{ word: string; hint: string; fakeWord?: string } | null>(null);
  currentPlayerIndex = signal<number>(0);
  gameStarted = signal<boolean>(false);
  currentSettings = signal<GameSettings | null>(null);
  startingPlayerId = signal<number | string | null>(null);
  eliminationsCount = signal<number>(0);
  drawings = signal<string[]>([]);

  // Propiedades Computadas
  currentPlayer = computed(() => {
    const index = this.currentPlayerIndex();
    const pList = this.players();
    return pList.length > 0 && index < pList.length ? pList[index] : null;
  });

  me = computed(() => {
    const myId = this.socketService.myPlayerId();
    const payload = this.socketService.rolePayload();
    const players = this.players();
    if (!myId) return null;
    
    const playerObj = players.find(p => p.id === myId);
    if (!playerObj) return null;

    return {
      ...playerObj,
      isImpostor: payload ? !!payload.isImpostor : !!playerObj.isImpostor,
      isDetective: payload ? !!payload.isDetective : !!playerObj.isDetective
    };
  });

  isRevealPhaseFinished = computed(() => {
    const state = this.socketService.roomState();
    return state ? state.status !== 'lobby' && state.status !== 'reveal' : false;
  });

  alivePlayers = computed(() => {
    return this.players().filter(p => !p.isEliminated);
  });

  currentHint = computed(() => {
    const payload = this.socketService.rolePayload();
    return payload ? payload.hint : null;
  });

  constructor() {
    // Sincronizar reactivamente el estado de la sala desde el socket a los signals locales
    effect(() => {
      const state = this.socketService.roomState();
      if (state) {
        this.players.set(state.players);
        this.currentPlayerIndex.set(state.currentPlayerIndex);
        this.gameStarted.set(state.status !== 'lobby');
        this.currentSettings.set(state.settings);
        this.startingPlayerId.set(state.startingPlayerId);
        this.eliminationsCount.set(state.eliminationsCount);
        this.drawings.set(state.drawings);
      } else {
        this.resetLocalSignals();
      }
    });

    // Sincronizar el payload del rol (seguridad autoritaria del servidor)
    effect(() => {
      const payload = this.socketService.rolePayload();
      if (payload) {
        this.secretWord.set({
          word: payload.word,
          hint: payload.hint,
        });
      } else {
        this.secretWord.set(null);
      }
    });
  }

  private resetLocalSignals() {
    this.players.set([]);
    this.secretWord.set(null);
    this.currentPlayerIndex.set(0);
    this.gameStarted.set(false);
    this.currentSettings.set(null);
    this.startingPlayerId.set(null);
    this.eliminationsCount.set(0);
    this.drawings.set([]);
  }

  startGame(settings: GameSettings) {
    const state = this.socketService.roomState();
    if (state && state.code) {
      this.socketService.syncSettings(state.code, settings);
      this.socketService.startGame(state.code);
    }
  }

  nextPlayer() {
    const state = this.socketService.roomState();
    if (state && state.code) {
      this.socketService.seeRole(state.code);
    }
  }

  eliminatePlayer(playerId: number | string) {
    const state = this.socketService.roomState();
    if (state && state.code) {
      this.socketService.eliminatePlayer(state.code, playerId.toString());
    }
  }

  resetGame() {
    const state = this.socketService.roomState();
    if (state && state.code) {
      this.socketService.resetGame(state.code);
    }
  }

  addDrawing(drawing: string) {
    const state = this.socketService.roomState();
    if (state && state.code) {
      this.socketService.submitDrawing(state.code, drawing);
    }
  }

  requestRematch() {
    const state = this.socketService.roomState();
    if (state && state.code) {
      this.socketService.requestRematch(state.code);
    }
  }

  playerReady() {
    const state = this.socketService.roomState();
    if (state && state.code) {
      this.socketService.playerReady(state.code);
    }
  }

  goToSetup() {
    const state = this.socketService.roomState();
    if (state && state.code) {
      this.socketService.goToSetup(state.code);
    }
  }

  startRematch() {
    const state = this.socketService.roomState();
    if (state && state.code) {
      this.socketService.startRematch(state.code);
    }
  }
}
