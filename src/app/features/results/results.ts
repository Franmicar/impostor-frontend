import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameEngineService } from '../../core/services/game-engine/game-engine';
import { AdsService } from '../../core/services/ads.service';
import { ThemeService } from '../../core/services/theme.service';
import { BillingService } from '../../core/services/billing.service';
import { UiService } from '../../core/services/ui/ui.service';
import { ButtonPrimaryComponent } from '../../shared/components/ui/button-primary.component';
import { ButtonSecondaryComponent } from '../../shared/components/ui/button-secondary.component';
import { SocketService } from '../../core/services/socket/socket.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonPrimaryComponent, ButtonSecondaryComponent],
  template: `
  <!-- Fixed Background -->
  <div class="fixed inset-0 z-30" [ngClass]="backgroundClass()"></div>

  <!-- Scrolling Content -->
  <div class="fixed inset-0 flex flex-col items-center px-6 text-textPrimary overflow-y-auto z-40 pb-[80px]">
   
   <!-- Confetti or dynamic background could go here -->
   
   <div class="bg-glass p-8 rounded-3xl backdrop-blur-2xl border border-glass-border text-center max-w-sm w-full z-10 shadow-[0_0_30px_rgba(255,255,255,0.1)] my-auto py-8">
    <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-wider sm:tracking-widest mb-2 leading-tight" [ngClass]="textClass()">
     {{ title() | translate }}
    </h1>
    
    <div class="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 mt-4">
    @if (winner === 'impostors') {
     @if (reason === 'time') {
      <p class="text-textMuted text-lg">{{ 'RESULTS.REASON_TIME' | translate }}</p>
     } @else if (reason === 'guess') {
      <p class="text-textMuted text-lg" [innerHTML]="'RESULTS.REASON_GUESS_FAIL' | translate: { name: '<span class=\\'font-bold text-indigo-400\\'>' + detectiveName + '</span>', guess: guess }"></p>
     } @else if (engine.currentSettings()?.modeId === 'fast') {
      <p class="text-textMuted text-lg">{{ 'RESULTS.REASON_FAST_FAIL' | translate }}</p>
     } @else {
      <p class="text-textMuted text-lg">{{ 'RESULTS.REASON_IMP_WIN' | translate }}</p>
     }
    } @else if (winner === 'town') {
     @if (reason === 'guess') {
       <p class="text-textMuted text-lg" [innerHTML]="'RESULTS.REASON_GUESS_WIN' | translate: { name: '<span class=\\'font-bold text-indigo-400\\'>' + detectiveName + '</span>', guess: guess }"></p>
     } @else {
       <p class="text-textMuted text-lg">{{ 'RESULTS.REASON_CIVILS_WIN' | translate }}</p>
     }
    } @else {
     <p class="text-textMuted text-lg">{{ 'RESULTS.NO_CLEAR_WIN' | translate }}</p>
    }
   </div>

    <div class="mb-8">
     <p class="text-sm text-textMuted uppercase tracking-widest mb-1 font-bold">{{ 'RESULTS.SECRET_WORD' | translate }}</p>
     <div class="bg-glass backdrop-blur border border-glass-border px-6 py-3 rounded-xl inline-block shadow-inner">
      <span class="text-3xl font-black font-mono text-textPrimary drop-shadow-md">{{ engine.secretWord()?.word || '???' }}</span>
     </div>
    </div>

    <div class="mb-8 items-center flex flex-col">
     <p class="text-sm text-textMuted uppercase tracking-widest mb-3 font-bold">{{ 'RESULTS.ROUND_IMPOSTORS' | translate }}</p>
     <div class="flex flex-wrap justify-center gap-2">
      @for (imp of impostors; track imp.id) {
       <span class="bg-primary/20 backdrop-blur text-primary font-bold px-4 py-2 rounded-lg border border-primary/50 shadow-[0_0_10px_rgb(var(--color-primary)/0.4)]">
        {{ imp.name }}
       </span>
      }
     </div>
    </div>

    @if (winner === 'town') {
     <div class="mb-8 items-center flex flex-col">
      @if (reason === 'guess') {
       <p class="text-sm text-indigo-400 font-bold uppercase tracking-widest mb-3 drop-shadow-sm">{{ 'RESULTS.WIN_DETS_TITLE' | translate }}</p>
       <div class="flex flex-wrap justify-center gap-2">
        @for (det of detectives; track det.id) {
         <span class="bg-indigo-500/20 backdrop-blur text-indigo-400 font-bold px-4 py-2 rounded-lg border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
          {{ det.name }}
         </span>
        }
       </div>
      } @else {
       <p class="text-sm text-textMuted font-bold uppercase tracking-widest mb-3">{{ 'RESULTS.WIN_CIVS_TITLE' | translate }}</p>
       <div class="flex flex-wrap justify-center gap-2 mb-3">
        @for (civ of survivingCivilians; track civ.id) {
         <span class="bg-secondary/20 backdrop-blur text-secondary font-bold px-4 py-2 rounded-lg border border-secondary/50 shadow-[0_0_10px_rgb(var(--color-secondary)/0.4)]">
          {{ civ.name }}
         </span>
        }
       </div>
       <p class="text-xs text-textMuted font-medium tracking-wide">{{ 'RESULTS.LOSERS_WARN' | translate }}</p>
      }
     </div>
    }

    <div class="mt-6 w-full">
      @if (!engine.isOnline()) {
        <!-- Local Game Play Again -->
        <app-button-primary (onClick)="playAgain()">
         {{ 'RESULTS.PLAY_AGAIN' | translate }}
        </app-button-primary>
      } @else {
        <!-- Online Game Rematch Lobby -->
        @if (socketService.roomState()?.rematchState; as rematch) {
          
          <!-- LOBBY CARD -->
          <div class="border-t border-glass-border pt-6 mt-4">
            <h3 class="text-xl font-bold uppercase tracking-wider mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {{ 'RESULTS.REMATCH_LOBBY' | translate }}
            </h3>

            <!-- idle state: waiting for host decision -->
            @if (rematch.status === 'idle') {
              @if (isHost()) {
                <div class="flex flex-col gap-3">
                  <app-button-primary (onClick)="requestRematch()">
                    {{ 'RESULTS.PLAY_AGAIN' | translate }}
                  </app-button-primary>
                  <app-button-secondary (onClick)="goToSetup()">
                    {{ 'RESULTS.CHANGE_SETTINGS' | translate }}
                  </app-button-secondary>
                </div>
              } @else {
                <div class="bg-glass border border-glass-border rounded-2xl p-4 flex flex-col items-center justify-center text-center animate-pulse">
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 rounded-full bg-primary animate-ping"></div>
                    <span class="text-sm font-semibold text-textMuted">
                      {{ 'RESULTS.WAITING_HOST_DECISION' | translate }}
                    </span>
                  </div>
                </div>
              }
            }

            <!-- rematch-check state: ready check list -->
            @if (rematch.status === 'rematch-check') {
              <!-- Connected Players List -->
               <div class="grid grid-cols-1 gap-2.5 max-h-48 overflow-y-auto custom-scrollbar mb-6">
                @for (player of getRematchPlayers(); track player.id) {
                  <div class="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3.5 pl-4">
                    <div class="flex items-center gap-3.5">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-xs relative border border-primary/40 shrink-0">
                        @if (player.photoUrl) {
                          <img [src]="player.photoUrl" class="w-full h-full object-cover rounded-full" />
                        } @else {
                          {{ player.name.substring(0,2) | uppercase }}
                        }
                      </div>
                      <div class="flex flex-col text-left">
                        <span class="text-sm font-bold text-textPrimary leading-tight">
                          {{ player.name }}
                          @if (player.id === socketService.myPlayerId()) {
                            <span class="text-xs text-primary font-normal"> {{ 'COMMON.ME' | translate }}</span>
                          }
                        </span>
                      </div>
                    </div>
                    
                    <!-- Status badge -->
                    <span class="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border" [ngClass]="player.statusClass">
                      {{ player.statusText | translate }}
                    </span>
                  </div>
                }
              </div>

              <!-- Action Buttons -->
              @if (isHost()) {
                <div class="flex flex-col gap-3">
                  <app-button-primary [disabled]="!canStartRematch()" (onClick)="startRematch()">
                    {{ 'RESULTS.START_GAME' | translate }} ({{ getReadyCount() }}/{{ socketService.roomState()?.players?.length || 0 }})
                  </app-button-primary>
                  <app-button-secondary (onClick)="goToSetup()">
                    {{ 'RESULTS.CHANGE_SETTINGS' | translate }}
                  </app-button-secondary>
                </div>
              } @else {
                @if (!isMeReady()) {
                  <app-button-primary (onClick)="playerReady()">
                    {{ 'RESULTS.PLAY_AGAIN' | translate }}
                  </app-button-primary>
                } @else {
                  <div class="bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl p-4 flex items-center justify-center text-center font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5 mr-2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {{ 'RESULTS.PLAYER_STATUS_READY' | translate | uppercase }} - {{ 'COMMON.WAITING_HOST' | translate }}
                  </div>
                }
              }
            }

          </div>
        }
      }
    </div>
   </div>
  </div>
 `,
  styles: `
  :host {
   display: block;
   width: 100%;
   height: 100%;
  }
 `
})
export class Results implements OnInit {
  engine = inject(GameEngineService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  adsService = inject(AdsService);
  themeService = inject(ThemeService);
  billing = inject(BillingService);
  ui = inject(UiService);
  destroyRef = inject(DestroyRef);
  socketService = inject(SocketService);

  showRoles = false;
  winner: 'impostors' | 'town' | null = null;
  reason: string | null = null;
  guess: string | null = null;
  detectiveName: string | null = null;

  impostors: any[] = [];
  survivingCivilians: any[] = [];
  detectives: any[] = [];

  ngOnInit() {
    this.route.queryParams.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.winner = params['winner'] || null;
      this.reason = params['reason'] || null;
      this.guess = params['guess'] || null;

      const dId = params['detectiveId'];
      if (dId) {
        this.detectiveName = this.engine.players().find(p => p.id.toString() === dId.toString())?.name || null;
      }

      if (this.reason === 'guess' && this.guess) {
        const secretWord = this.engine.secretWord()?.word;
        const isCorrect = secretWord ? this.guess.toLowerCase().trim() === secretWord.toLowerCase().trim() : false;
        if (isCorrect) {
          this.winner = 'town';
        } else {
          this.winner = 'impostors';
        }
      }
    });

    if (this.engine.isOnline()) {
      const state = this.socketService.roomState();
      const results = state?.resultsData || {};
      const impIds = results.impostorIds || [];
      const detIds = results.detectiveIds || [];

      this.impostors = this.engine.players().filter(p => impIds.includes(p.id));
      this.detectives = this.engine.players().filter(p => detIds.includes(p.id));
      this.survivingCivilians = this.engine.players().filter(p => 
        !impIds.includes(p.id) && 
        !detIds.includes(p.id) && 
        !p.isEliminated
      );
    } else {
      this.impostors = this.engine.players().filter(p => p.isImpostor);
      this.survivingCivilians = this.engine.alivePlayers().filter(p => !p.isImpostor && !p.isDetective);
      this.detectives = this.engine.players().filter(p => p.isDetective);
    }
  }

  title() {
    if (this.winner === 'impostors') return 'RESULTS.WIN_IMPOSTORS';
    if (this.winner === 'town') {
      if (this.reason === 'guess') return 'RESULTS.WIN_DETECTIVES';
      return 'RESULTS.WIN_CIVILS';
    }
    return 'RESULTS.ABORTED';
  }

  subtitle() {
    if (this.reason === 'time') return 'El tiempo se agotó.';
    if (this.reason === 'guess') return 'El detective falló intentando adivinar.';
    if (this.winner === 'impostors') return 'Los impostores lograron igualar en número al pueblo.';
    if (this.winner === 'town') return 'Todos los impostores han sido eliminados del juego.';
    return '';
  }

  backgroundClass() {
    if (this.themeService.currentTheme() === 'infantil') return 'bg-transparent';
    if (this.winner === 'town') {
      if (this.reason === 'guess') return 'bg-gradient-to-br from-indigo-900 to-slate-900';
      return 'bg-gradient-to-br from-cyan-900 to-slate-900';
    }
    return 'bg-gradient-to-br from-pink-900 to-slate-900';
  }

  textClass() {
    if (this.themeService.currentTheme() === 'infantil') {
      if (this.winner === 'town') {
        if (this.reason === 'guess') return 'text-indigo-600 drop-shadow-sm';
        return 'text-cyan-600 drop-shadow-sm';
      }
      return 'text-pink-600 drop-shadow-sm';
    }
    if (this.winner === 'town') {
      if (this.reason === 'guess') return 'text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]';
      return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]';
    }
    return 'text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]';
  }

  async playAgain() {
    this.ui.setLoading(true);
    try {
      await this.adsService.showInterstitial();
      const isOnline = this.engine.isOnline();
      this.engine.resetGame();
      if (!isOnline) {
        await this.router.navigate(['/setup']);
      }
    } finally {
      this.ui.setLoading(false);
    }
  }

  isHost() {
    const me = this.engine.me();
    return me ? !!me.isHost : false;
  }

  requestRematch() {
    this.engine.requestRematch();
  }

  playerReady() {
    this.engine.playerReady();
  }

  goToSetup() {
    this.engine.goToSetup();
  }

  startRematch() {
    this.engine.startRematch();
  }

  isMeReady() {
    const myId = this.socketService.myPlayerId();
    const state = this.socketService.roomState();
    if (!myId || !state || !state.rematchState) return false;
    return (state.rematchState.readyPlayers || []).includes(myId);
  }

  canStartRematch() {
    const state = this.socketService.roomState();
    if (!state || !state.rematchState) return false;
    const readyIds = state.rematchState.readyPlayers || [];
    const activeReady = state.players.filter((p: any) => p.status === 'active' && readyIds.includes(p.id));
    return activeReady.length >= 3;
  }

  getReadyCount() {
    const state = this.socketService.roomState();
    if (!state || !state.rematchState) return 0;
    const readyIds = state.rematchState.readyPlayers || [];
    const activeReady = state.players.filter((p: any) => p.status === 'active' && readyIds.includes(p.id));
    return activeReady.length;
  }

  getRematchPlayers() {
    const state = this.socketService.roomState();
    if (!state || !state.rematchState) return [];

    const rematch = state.rematchState;
    const lastActive = rematch.lastActivePlayers || [];
    const currentPlayers = state.players || [];
    const readyList = rematch.readyPlayers || [];

    const list = lastActive.map((p: any) => {
      const current = currentPlayers.find((cp: any) => cp.id === p.id);
      let statusText = 'RESULTS.PLAYER_STATUS_LEFT';
      let statusClass = 'text-red-400 bg-red-500/10 border-red-500/30';
      let isReady = false;
      let isDisconnected = false;
      let isLeft = true;

      if (current) {
        isLeft = false;
        if (current.status === 'away') {
          isDisconnected = true;
          statusText = 'RESULTS.PLAYER_STATUS_DISCONNECTED';
          statusClass = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
        } else if (readyList.includes(p.id)) {
          isReady = true;
          statusText = 'RESULTS.PLAYER_STATUS_READY';
          statusClass = 'text-green-400 bg-green-500/10 border-green-500/30';
        } else {
          statusText = 'RESULTS.PLAYER_STATUS_WAITING';
          statusClass = 'text-blue-400 bg-blue-500/10 border-blue-500/30 animate-pulse';
        }
      }

      return {
        ...p,
        isReady,
        isDisconnected,
        isLeft,
        statusText,
        statusClass
      };
    });

    currentPlayers.forEach((cp: any) => {
      if (!list.some((lp: any) => lp.id === cp.id)) {
        let statusText = 'RESULTS.PLAYER_STATUS_WAITING';
        let statusClass = 'text-blue-400 bg-blue-500/10 border-blue-500/30 animate-pulse';
        let isReady = false;
        let isDisconnected = cp.status === 'away';

        if (isDisconnected) {
          statusText = 'RESULTS.PLAYER_STATUS_DISCONNECTED';
          statusClass = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
        } else if (readyList.includes(cp.id)) {
          isReady = true;
          statusText = 'RESULTS.PLAYER_STATUS_READY';
          statusClass = 'text-green-400 bg-green-500/10 border-green-500/30';
        }

        list.push({
          id: cp.id,
          name: cp.name,
          photoUrl: cp.photoUrl,
          isReady,
          isDisconnected,
          isLeft: false,
          statusText,
          statusClass
        });
      }
    });

    return list;
  }
}
