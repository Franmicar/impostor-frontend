import { Injectable, signal, effect } from '@angular/core';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  Track,
  Participant
} from 'livekit-client';
import { App } from '@capacitor/app';

export interface ParticipantVoiceState {
  isMuted: boolean;
  isTalking: boolean;
  volume: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceChatService {
  private room: Room | null = null;
  private lastToken: string | null = null;
  private lastServerUrl: string | null = null;


  // Reactive state signals for UI components
  public isConnected = signal<boolean>(false);
  public isMuted = signal<boolean>(false);
  public activeSpeakers = signal<string[]>([]); // Array of UIDs currently speaking
  public participantStatus = signal<Record<string, ParticipantVoiceState>>({});

  constructor() {
    // Listen to mobile app lifecycle for auto-reconnection
    try {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          if (this.lastToken && this.lastServerUrl && !this.isConnected()) {
            console.log('LiveKit: App returned to foreground, trying to reconnect to voice room...');
            this.connectToRoom(this.lastToken, this.lastServerUrl).catch(e => {
              console.error('Failed to reconnect on foreground:', e);
            });
          }
        }
      });
    } catch (e) {
      console.warn('App lifecycle listener not available (likely running in pure web environment):', e);
    }
  }


  /**
   * Connects to a LiveKit room using the signed JWT token.
   */
  async connectToRoom(token: string, serverUrl: string): Promise<void> {
    if (this.room) {
      await this.disconnect();
    }

    this.lastToken = token;
    this.lastServerUrl = serverUrl;

    try {
      // Initialize LiveKit Room with optimal audio config for mobile (Adaptive Stream + dynacast)
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          audioPreset: {
            maxBitrate: 32000 // Voice-only compression optimized for low bandwidth
          }
        }
      });

      this.setupRoomEventListeners(this.room);

      // Connect to the room WebRTC SFU
      await this.room.connect(serverUrl, token);
      this.isConnected.set(true);

      // Enable local microphone by default
      try {
        await this.room.localParticipant.setMicrophoneEnabled(true);
        this.isMuted.set(false);
      } catch (micErr) {
        console.warn('LiveKit: No se pudo activar el micrófono (quizás falten permisos o estén denegados):', micErr);
        this.isMuted.set(true);
      }

      // Initialize status of current participants
      this.updateAllParticipantsStatus();

      console.log('LiveKit: Conectado con éxito a la sala de voz.');
    } catch (e) {
      console.error('Error conectándose a la sala de voz LiveKit:', e);
      this.isConnected.set(false);
      this.room = null;
      throw e;
    }
  }

  /**
   * Disconnects and releases microphone resources.
   */
  async disconnect(): Promise<void> {
    if (!this.room) return;

    try {
      // Disable local track publishing before disconnecting
      if (this.room.localParticipant) {
        await this.room.localParticipant.setMicrophoneEnabled(false);
      }
      await this.room.disconnect();
    } catch (e) {
      console.error('Error al desconectar de LiveKit:', e);
    } finally {
      this.room = null;
      this.lastToken = null;
      this.lastServerUrl = null;
      this.isConnected.set(false);
      this.isMuted.set(false);
      this.activeSpeakers.set([]);
      this.participantStatus.set({});
      console.log('LiveKit: Desconectado de la sala de voz.');
    }
  }

  /**
   * Toggles the local microphone mute state.
   */
  async toggleMute(): Promise<boolean> {
    if (!this.room || !this.room.localParticipant) return false;

    try {
      const nextMutedState = !this.isMuted();
      await this.room.localParticipant.setMicrophoneEnabled(!nextMutedState);
      this.isMuted.set(nextMutedState);
      return nextMutedState;
    } catch (e) {
      console.error('Error modificando estado de silencio local:', e);
      return this.isMuted();
    }
  }

  /**
   * Sets the local microphone mute state directly.
   */
  async setMuted(muted: boolean): Promise<void> {
    if (!this.room || !this.room.localParticipant) return;

    try {
      await this.room.localParticipant.setMicrophoneEnabled(!muted);
      this.isMuted.set(muted);
    } catch (e) {
      console.error(`Error al establecer silencio en ${muted}:`, e);
    }
  }


  /**
   * Adjusts the local volume for a specific remote participant's audio track.
   * Volume ranges from 0.0 (mute) to 1.0 (max).
   */
  setVolume(participantIdentity: string, volume: number): void {
    if (!this.room) return;

    const participant = this.room.remoteParticipants.get(participantIdentity);
    if (!participant) return;

    // Save volume configuration locally in state
    const currentStatus = this.participantStatus();
    if (currentStatus[participantIdentity]) {
      currentStatus[participantIdentity] = {
        ...currentStatus[participantIdentity],
        volume
      };
      this.participantStatus.set({ ...currentStatus });
    }

    // Apply volume directly to participant's audio tracks
    participant.audioTrackPublications.forEach((pub: any) => {
      if (pub.track && pub.track instanceof RemoteTrack) {
        (pub.track as any).setVolume(volume);
      }
    });
  }

  // --- PRIVATE HELPERS AND EVENT HANDLERS ---

  private setupRoomEventListeners(room: Room) {
    // 1. Track subscribed: Play remote audio streams
    room.on(RoomEvent.TrackSubscribed, (track: any, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Audio) {
        // Attach the audio element to play sound automatically
        const audioElement = track.attach();
        
        // Restore local volume preference if previously configured
        const userPrefs = this.participantStatus()[participant.identity];
        if (userPrefs && track.setVolume) {
          track.setVolume(userPrefs.volume);
        }

        console.log(`LiveKit: Pista de audio subscrita y sonando para el jugador: ${participant.name || participant.identity}`);
      }
    });

    // 2. Track unsubscribed: Remove audio elements
    room.on(RoomEvent.TrackUnsubscribed, (track: any, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Audio) {
        track.detach();
        console.log(`LiveKit: Pista de audio cancelada para el jugador: ${participant.name || participant.identity}`);
      }
    });

    // 3. Active Speakers Changed: Update talk lights
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      const speakerIds = speakers.map(s => s.identity);
      this.activeSpeakers.set(speakerIds);
      
      // Sync isTalking state inside participant status mapping
      const current = this.participantStatus();
      Object.keys(current).forEach(uid => {
        current[uid] = {
          ...current[uid],
          isTalking: speakerIds.includes(uid)
        };
      });
      this.participantStatus.set({ ...current });
    });

    // 4. Participant join/leave state updates
    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      this.updateParticipantStatus(participant);
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      const current = this.participantStatus();
      delete current[participant.identity];
      this.participantStatus.set({ ...current });
    });

    // 5. Track mute updates (detect when others mute themselves)
    room.on(RoomEvent.TrackMuted, (publication: any, participant: Participant) => {
      if (publication.kind === Track.Kind.Audio) {
        this.updateParticipantStatus(participant);
      }
    });

    room.on(RoomEvent.TrackUnmuted, (publication: any, participant: Participant) => {
      if (publication.kind === Track.Kind.Audio) {
        this.updateParticipantStatus(participant);
      }
    });
  }

  /**
   * Refreshes the local cache metadata status mapping for a participant.
   */
  private updateParticipantStatus(participant: Participant) {
    const current = this.participantStatus();
    
    // Check if participant has microphone active
    const isMuted = !participant.isMicrophoneEnabled;
    const existing = current[participant.identity];

    current[participant.identity] = {
      isMuted,
      isTalking: this.activeSpeakers().includes(participant.identity),
      volume: existing ? existing.volume : 1.0, // Default to full volume
      name: participant.name || 'Player'
    };

    this.participantStatus.set({ ...current });
  }

  /**
   * Refreshes the status mapping for all participants connected to the room.
   */
  private updateAllParticipantsStatus() {
    if (!this.room) return;

    const current: Record<string, ParticipantVoiceState> = {};
    
    // Add remote participants
    this.room.remoteParticipants.forEach((participant) => {
      const isMuted = !participant.isMicrophoneEnabled;
      current[participant.identity] = {
        isMuted,
        isTalking: this.activeSpeakers().includes(participant.identity),
        volume: 1.0,
        name: participant.name || 'Player'
      };
    });

    this.participantStatus.set(current);
  }
}
