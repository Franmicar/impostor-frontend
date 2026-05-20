import { Injectable, signal, computed } from '@angular/core';
import { IGameEngine, Player, GameSettings } from './game-engine.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalGameEngineService implements IGameEngine {
  // Game State
  players = signal<Player[]>([]);
  secretWord = signal<{ word: string; hint: string; fakeWord?: string } | null>(null);
  currentPlayerIndex = signal<number>(0);
  gameStarted = signal<boolean>(false);
  currentSettings = signal<GameSettings | null>(null);
  startingPlayerId = signal<number | string | null>(null);
  eliminationsCount = signal<number>(0);
  drawings = signal<string[]>([]);

  // Computed Properties
  currentPlayer = computed(() => {
    const index = this.currentPlayerIndex();
    const pList = this.players();
    return pList.length > 0 && index < pList.length ? pList[index] : null;
  });

  isRevealPhaseFinished = computed(() => {
    return this.gameStarted() && this.currentPlayerIndex() >= this.players().length;
  });

  alivePlayers = computed(() => {
    return this.players().filter(p => !p.isEliminated);
  });

  eliminatePlayer(playerId: number | string) {
    this.players.update(list => list.map(p =>
      p.id === playerId ? { ...p, isEliminated: true } : p
    ));
    this.eliminationsCount.update(count => count + 1);
  }

  getTeammates = computed(() => {
    return (playerId: number | string) => {
      const pList = this.players();
      const p = pList.find(p => p.id === playerId);
      if (!p || !p.isImpostor) return [];
      return pList.filter(other => other.isImpostor && other.id !== playerId);
    };
  });

  currentHint = computed(() => {
    const p = this.currentPlayer();
    const settings = this.currentSettings();
    const wordObj = this.secretWord();

    if (!p || !settings || !wordObj || !p.isImpostor) return null;

    const hintSetting = settings.hints; // 'none', 'all', 'first'

    if (hintSetting === 'none') {
      return null;
    } else if (hintSetting === 'all') {
      return wordObj.hint;
    } else if (hintSetting === 'first') {
      return p.id === this.startingPlayerId() ? wordObj.hint : null;
    }

    return null;
  });

  startGame(settings: GameSettings) {
    this.drawings.set([]);
    let { playerData, words, numImpostors, numDetectives, modeId, gameTypeId } = settings;

    if (playerData.length < 3) throw new Error('At least 3 players required');
    if (words.length === 0) throw new Error('Word list cannot be empty');

    // Override impostors for chaos mode
    if (modeId === 'chaos') {
      numImpostors = Math.floor(Math.random() * (playerData.length + 1));
    }

    this.currentSettings.set({ ...settings, numImpostors, gameTypeId });

    // Pick a random word object
    const randomWordObj = words[Math.floor(Math.random() * words.length)];
    this.secretWord.set(randomWordObj);

    // Create player objects
    let initPlayers: Player[] = playerData.map((pd, index) => ({
      id: index + 1,
      name: pd.name,
      photoUrl: pd.photoUrl,
      isImpostor: false,
      hasSeenRole: false,
      isEliminated: false
    }));

    // Assign impostors randomly
    let impostorsAssigned = 0;
    while (impostorsAssigned < numImpostors && impostorsAssigned < playerData.length) {
      const randomIndex = Math.floor(Math.random() * initPlayers.length);
      if (!initPlayers[randomIndex].isImpostor) {
        initPlayers[randomIndex].isImpostor = true;
        impostorsAssigned++;
      }
    }

    // Assign detectives (if any)
    let detectivesAssigned = 0;
    while (detectivesAssigned < numDetectives && (impostorsAssigned + detectivesAssigned) < playerData.length) {
      const randomIndex = Math.floor(Math.random() * initPlayers.length);
      if (!initPlayers[randomIndex].isImpostor && !initPlayers[randomIndex].isDetective) {
        initPlayers[randomIndex].isDetective = true;
        detectivesAssigned++;
      }
    }

    // Determine starting player
    const randomStartingPlayer = initPlayers[Math.floor(Math.random() * initPlayers.length)];
    this.startingPlayerId.set(randomStartingPlayer.id);

    this.players.set(initPlayers);
    this.currentPlayerIndex.set(0);
    this.gameStarted.set(true);
    this.eliminationsCount.set(0);
  }

  nextPlayer() {
    if (this.isRevealPhaseFinished()) return;

    this.players.update(list => {
      const current = list[this.currentPlayerIndex()];
      current.hasSeenRole = true;
      return [...list];
    });

    this.currentPlayerIndex.update(i => i + 1);
  }

  resetGame() {
    this.players.set([]);
    this.secretWord.set(null);
    this.currentPlayerIndex.set(0);
    this.gameStarted.set(false);
    this.startingPlayerId.set(null);
    this.eliminationsCount.set(0);
  }
}
