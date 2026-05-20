import { Injectable, signal, computed, inject } from '@angular/core';
import { IGameEngine, Player, GameSettings } from './game-engine.interface';
import { LocalGameEngineService } from './local-game-engine.service';
import { RemoteGameEngineService } from './remote-game-engine.service';

export type { Player, GameSettings, IGameEngine } from './game-engine.interface';

@Injectable({
  providedIn: 'root'
})
export class GameEngineService implements IGameEngine {
  private localEngine = inject(LocalGameEngineService);
  private remoteEngine = inject(RemoteGameEngineService);

  // Selector de Modo (Online/Offline)
  isOnline = signal<boolean>(false);

  // Motor activo basado en el modo
  private activeEngine = computed(() => {
    return this.isOnline() ? this.remoteEngine : this.localEngine;
  });

  // Re-exposición reactiva de los signals del motor activo (mantiene compatibilidad total con la UI)
  players = computed(() => this.activeEngine().players());
  secretWord = computed(() => this.activeEngine().secretWord());
  currentPlayerIndex = computed(() => this.activeEngine().currentPlayerIndex());
  gameStarted = computed(() => this.activeEngine().gameStarted());
  currentSettings = computed(() => this.activeEngine().currentSettings());
  startingPlayerId = computed(() => this.activeEngine().startingPlayerId());
  eliminationsCount = computed(() => this.activeEngine().eliminationsCount());
  drawings = computed(() => this.activeEngine().drawings());

  // Propiedades Computadas
  currentPlayer = computed(() => {
    if (this.isOnline()) {
      if (!this.remoteEngine.isRevealPhaseFinished() && this.remoteEngine.gameStarted()) {
        return this.remoteEngine.me();
      }
    }
    return this.activeEngine().currentPlayer();
  });
  
  me = computed(() => {
    if (this.isOnline()) {
      return this.remoteEngine.me();
    }
    return this.currentPlayer();
  });
  
  isRevealPhaseFinished = computed(() => this.activeEngine().isRevealPhaseFinished());
  alivePlayers = computed(() => this.activeEngine().alivePlayers());
  currentHint = computed(() => this.activeEngine().currentHint());

  getTeammates = computed(() => {
    return (playerId: number | string) => {
      const pList = this.players();
      const p = pList.find(p => p.id === playerId);
      if (!p || !p.isImpostor) return [];
      return pList.filter(other => other.isImpostor && other.id !== playerId);
    };
  });

  // Métodos de Interfaz dirigidos al motor correspondiente
  startGame(settings: GameSettings) {
    this.activeEngine().startGame(settings);
  }

  nextPlayer() {
    this.activeEngine().nextPlayer();
  }

  eliminatePlayer(playerId: number | string) {
    this.activeEngine().eliminatePlayer(playerId);
  }

  resetGame() {
    this.activeEngine().resetGame();
  }

  addDrawing(drawing: string) {
    this.activeEngine().addDrawing(drawing);
  }
}
