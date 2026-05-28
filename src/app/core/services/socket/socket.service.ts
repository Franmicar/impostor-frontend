import { Injectable, signal, inject, effect } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Preferences } from '@capacitor/preferences';
import { Subject, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private authService = inject(AuthService);
  private router = inject(Router);
  private socket: Socket | null = null;

  // Estados Reactivos
  connected = signal<boolean>(false);
  roomState = signal<any | null>(null);
  rolePayload = signal<any | null>(null);
  errorMsg = signal<string | null>(null);
  myPlayerId = signal<string | null>(null);

  // Streams de Eventos
  stroke$ = new Subject<any>();
  playerVoted$ = new Subject<any>();
  guessResult$ = new Subject<any>();
  voiceToken$ = new ReplaySubject<{ token: string; serverUrl: string }>(1);

  constructor() {
    this.init();

    // Sincronizar dinámicamente el ID del jugador con el estado de autenticación
    effect(() => {
      const user = this.authService.userSignal();
      if (user) {
        this.myPlayerId.set(user.uid);
      } else {
        // Cargar UUID local para modo invitado/offline
        Preferences.get({ key: 'deceptra_device_uuid' }).then(({ value }) => {
          if (value) {
            this.myPlayerId.set(value);
          } else {
            const newId = this.generateUuid();
            Preferences.set({ key: 'deceptra_device_uuid', value: newId }).then(() => {
              this.myPlayerId.set(newId);
            });
          }
        });
      }
    });

    // Conectarse automáticamente si refresca en mitad de partida online
    this.checkAutoConnect();

    // Redirección centralizada y sincronizada basada en el estado de la sala
    effect(() => {
      const state = this.roomState();
      if (!state) return;

      const currentUrl = this.router.url;
      const status = state.status;

      if (status === 'lobby') {
        if (!currentUrl.includes('/setup')) {
          this.router.navigate(['/setup'], { state: { intentional: true } });
        }
      } else if (status === 'reveal' || status === 'play') {
        if (!currentUrl.includes('/play')) {
          this.router.navigate(['/play'], { state: { intentional: true } });
        }
      } else if (status === 'vote' || status === 'vote-resolved') {
        if (!currentUrl.includes('/vote')) {
          this.router.navigate(['/vote'], { state: { intentional: true } });
        }
      } else if (status === 'results') {
        if (!currentUrl.includes('/results')) {
          const results = state.resultsData || {};
          this.router.navigate(['/results'], {
            queryParams: {
              winner: state.winnerTeam,
              reason: results.reason,
              guess: results.guess,
              detectiveId: results.detectiveId
            },
            state: { intentional: true }
          });
        }
      }
    });
  }

  private init() {
    this.socket = io(environment.multiplayerUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
      console.log('Conectado al servidor multijugador');
      
      // Auto-reunirse a la sala si había una guardada
      this.tryAutoRejoin();
    });

    this.socket.on('disconnect', () => {
      this.connected.set(false);
      console.log('Desconectado del servidor multijugador');
    });

    this.socket.on('room-state', (state) => {
      this.roomState.set(state);
      this.errorMsg.set(null);
    });

    this.socket.on('role-payload', (payload) => {
      this.rolePayload.set(payload);
    });

    this.socket.on('error-msg', (msg) => {
      this.errorMsg.set(msg);
    });

    this.socket.on('stroke', (stroke) => {
      this.stroke$.next(stroke);
    });

    this.socket.on('player-voted', (vote) => {
      this.playerVoted$.next(vote);
    });

    this.socket.on('guess-result', (result) => {
      this.guessResult$.next(result);
    });

    this.socket.on('voice-token', (payload) => {
      this.voiceToken$.next(payload);
    });
  }

  connect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.roomState.set(null);
    this.rolePayload.set(null);
    Preferences.remove({ key: 'deceptra_last_room_code' });
  }

  async getPlayerId(): Promise<string> {
    const user = this.authService.currentUser;
    let id: string;
    if (user) {
      id = user.uid;
    } else {
      const { value } = await Preferences.get({ key: 'deceptra_device_uuid' });
      if (value) {
        id = value;
      } else {
        id = this.generateUuid();
        await Preferences.set({ key: 'deceptra_device_uuid', value: id });
      }
    }
    this.myPlayerId.set(id);
    return id;
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async createRoom(playerName: string, photoUrl?: string) {
    this.connect();
    const id = await this.getPlayerId();
    
    // Guardar nombre y foto del host para reconexión
    await Preferences.set({ key: 'deceptra_player_name', value: playerName });
    if (photoUrl) {
      await Preferences.set({ key: 'deceptra_player_photo', value: photoUrl });
    }

    this.socket?.emit('create-room', { id, name: playerName, photoUrl });

    // Esperar a recibir el estado para guardar el código de la sala
    const sub = this.roomStateSignalEffect((state) => {
      if (state && state.code) {
        Preferences.set({ key: 'deceptra_last_room_code', value: state.code });
        sub.unsubscribe();
      }
    });
  }

  async joinRoom(code: string, playerName: string, photoUrl?: string) {
    this.connect();
    const id = await this.getPlayerId();

    await Preferences.set({ key: 'deceptra_player_name', value: playerName });
    if (photoUrl) {
      await Preferences.set({ key: 'deceptra_player_photo', value: photoUrl });
    }
    await Preferences.set({ key: 'deceptra_last_room_code', value: code.toUpperCase() });

    this.socket?.emit('join-room', {
      code,
      player: { id, name: playerName, photoUrl }
    });
  }

  syncSettings(code: string, settings: any) {
    this.socket?.emit('sync-settings', { code, settings });
  }

  startGame(code: string) {
    this.socket?.emit('start-game', { code });
  }

  seeRole(code: string) {
    this.socket?.emit('see-role', { code });
  }

  eliminatePlayer(code: string, playerId: string) {
    this.socket?.emit('eliminate-player', { code, playerId });
  }

  drawStroke(code: string, stroke: any) {
    this.socket?.emit('draw-stroke', { code, stroke });
  }

  submitDrawing(code: string, drawing: string) {
    this.socket?.emit('submit-drawing', { code, drawing });
  }

  startVoting(code: string) {
    this.socket?.emit('start-voting', { code });
  }

  castVote(code: string, targetId: string) {
    this.socket?.emit('cast-vote', { code, targetId });
  }

  submitGuess(code: string, detectiveId: string, word: string) {
    this.socket?.emit('submit-guess', { code, guess: { detectiveId, word } });
  }

  resetGame(code: string) {
    this.socket?.emit('reset-game', { code });
  }

  requestRematch(code: string) {
    this.socket?.emit('request-rematch', { code });
  }

  playerReady(code: string) {
    this.socket?.emit('player-ready', { code });
  }

  goToSetup(code: string) {
    this.socket?.emit('go-to-setup', { code });
  }

  startRematch(code: string) {
    this.socket?.emit('start-rematch', { code });
  }

  private async checkAutoConnect() {
    const { value: code } = await Preferences.get({ key: 'deceptra_last_room_code' });
    const { value: name } = await Preferences.get({ key: 'deceptra_player_name' });
    if (code && name) {
      console.log('SocketService: Detectado código de sala guardado, auto-conectando...');
      this.connect();
    }
  }

  private async tryAutoRejoin() {
    const { value: code } = await Preferences.get({ key: 'deceptra_last_room_code' });
    const { value: name } = await Preferences.get({ key: 'deceptra_player_name' });
    const { value: photo } = await Preferences.get({ key: 'deceptra_player_photo' });

    if (code && name && this.socket?.connected) {
      const id = await this.getPlayerId();
      console.log(`Intentando reconexión automática a sala: ${code}`);
      this.socket.emit('join-room', {
        code,
        player: { id, name, photoUrl: photo || undefined }
      });
    }
  }

  // Utilidad para suscribirse a cambios de un Signal (similar a effect, pero seguro fuera del constructor)
  private roomStateSignalEffect(callback: (value: any) => void) {
    const checkState = setInterval(() => {
      const state = this.roomState();
      if (state) {
        callback(state);
      }
    }, 100);

    return {
      unsubscribe: () => clearInterval(checkState)
    };
  }
}
