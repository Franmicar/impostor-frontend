import { Component, inject, signal, HostListener, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GameEngineService } from '../../core/services/game-engine/game-engine';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="min-h-screen bg-transparent text-slate-50 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      
      @if (!engine.gameStarted()) {
        <p>{{ 'PLAY.NO_ACTIVE_GAME' | translate }}</p>
        <button (click)="router.navigate(['/setup'])" class="mt-4 text-pink-500 underline">{{ 'PLAY.BACK_TO_SETUP' | translate }}</button>
      } @else if (engine.isRevealPhaseFinished()) {
        <!-- Transition to Voting/Timer with Roulette -->
        <div class="flex flex-col items-center justify-center w-full max-w-sm flex-1">
          @if (isRouletteSpinning()) {
             <h2 class="text-xl font-bold text-slate-300 mb-6 tracking-widest uppercase text-center drop-shadow-md">{{ 'PLAY.DECIDING_TURN' | translate }}</h2>
             <div class="w-full bg-glass backdrop-blur-xl border-2 border-secondary rounded-3xl py-12 shadow-[0_0_30px_rgba(13,242,242,0.4)] flex justify-center items-center">
                <h3 class="text-4xl font-black text-white px-4 text-center truncate drop-shadow-lg">{{ currentRouletteName() }}</h3>
             </div>
          } @else {
             <h2 class="text-3xl font-bold mb-2 text-center text-slate-200 drop-shadow-md">{{ 'PLAY.ALL_ROLES_SEEN' | translate }}</h2>
             
             <div class="w-full bg-glass backdrop-blur-xl rounded-3xl p-8 border-2 border-primary my-8 flex flex-col items-center shadow-[0_0_40px_rgba(242,13,185,0.3)]">
                 <span class="text-slate-300 uppercase tracking-widest text-xs font-bold mb-4">{{ 'PLAY.STARTS' | translate }}</span>
                 <h2 class="text-4xl font-black text-secondary text-center drop-shadow-[0_0_15px_rgba(13,242,242,0.6)]">{{ winnerName() }}</h2>
             </div>
             
             <button 
               (click)="goToVote()" 
               class="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-xl shadow-[0_0_20px_rgba(242,13,185,0.4)] hover:shadow-[0_0_30px_rgba(13,242,242,0.5)] active:scale-95 transition-all text-center">
               {{ 'PLAY.PLAY_BTN' | translate }}
             </button>
          }
        </div>
      } @else {
        <!-- Pass and Play -->
        <div class="w-full max-w-sm flex-1 flex flex-col relative py-12">
            
            <div class="text-center mb-8 z-20 relative bg-glass backdrop-blur-md border border-glass-border rounded-2xl py-4 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] mx-auto w-full">
                <h2 class="text-4xl font-black text-white drop-shadow-lg">{{ engine.currentPlayer()?.name }}</h2>
            </div>
            
            <!-- Cards Container -->
            <div class="flex-1 relative flex items-center justify-center">
                
                <!-- Secret Content (Provides the height) -->
                <div class="relative w-full bg-glass backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center border border-glass-border shadow-2xl z-0 min-h-[300px]">
                    <h3 class="text-xl font-bold text-slate-300 mb-2 drop-shadow-sm">{{ 'PLAY.YOU_ARE' | translate }}</h3>
                    
                    @if (engine.currentPlayer()?.isImpostor && engine.currentSettings()?.modeId !== 'infiltrator') {
                        <h1 class="text-4xl font-black text-primary mb-8 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(242,13,185,0.6)]">{{ 'PLAY.IMPOSTOR_TITLE' | translate }}</h1>
                        @if (engine.currentSettings()?.modeId === 'team') {
                            <p class="text-slate-300 text-center mb-4">{{ 'PLAY.TEAMMATES' | translate }}</p>
                            <div class="flex flex-wrap justify-center gap-2 mb-6">
                                @if (engine.getTeammates()(engine.currentPlayer()?.id || 0).length > 0) {
                                    @for (mate of engine.getTeammates()(engine.currentPlayer()?.id || 0); track mate.id) {
                                        <span class="bg-primary/20 text-primary font-bold px-3 py-1 rounded-lg border border-primary/50 shadow-[0_0_10px_rgba(242,13,185,0.2)]">
                                            {{ mate.name }}
                                        </span>
                                    }
                                } @else {
                                    <span class="text-slate-400 italic">{{ 'PLAY.ALONE_IMPOSTOR' | translate }}</span>
                                }
                            </div>
                        } @else {
                            <p class="text-slate-300 text-center mb-6">
                                @if (engine.currentHint()) {
                                    <span class="font-bold text-primary drop-shadow-md">{{ 'PLAY.HINT_IS' | translate }}</span> {{ engine.currentHint() }}
                                } @else {
                                    {{ 'PLAY.NO_HINT' | translate }}
                                }
                            </p>
                        }
                    } @else if (engine.currentPlayer()?.isDetective) {
                        <h1 class="text-4xl font-black text-indigo-400 mb-4 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(129,140,248,0.6)]">{{ 'PLAY.DETECTIVE_TITLE' | translate }}</h1>
                        <p class="text-slate-300 text-center mb-6">{{ 'PLAY.DETECTIVE_DESC' | translate }}</p>
                    } @else {
                        <h1 class="text-4xl font-black text-secondary mb-2 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(13,242,242,0.6)]">{{ 'PLAY.CIVIL_TITLE' | translate }}</h1>
                        <p class="text-slate-300 text-center mb-6">{{ 'PLAY.SECRET_WORD_IS' | translate }}</p>
                        <div class="bg-black/40 border border-white/10 px-6 py-4 rounded-xl mb-4 flex justify-center items-center text-center backdrop-blur shadow-inner">
                            @if (engine.currentPlayer()?.isImpostor && engine.currentSettings()?.modeId === 'infiltrator') {
                                <span class="text-3xl font-bold text-white tracking-wider drop-shadow-md">{{ engine.secretWord()?.fakeWord }}</span>
                            } @else {
                                <span class="text-3xl font-bold text-white tracking-wider drop-shadow-md">{{ engine.secretWord()?.word }}</span>
                            }
                        </div>
                    }

                </div>
                
                <!-- Slide Cover -->
                <div 
                    class="absolute inset-0 w-full h-full bg-glass backdrop-blur-2xl border border-glass-border rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-grab active:cursor-grabbing z-10 transition-transform select-none"
                    [style.transform]="slideTransform()"
                    [class.duration-300]="!isDragging()"
                    (mousedown)="onDragStart($event)"
                    (touchstart)="onDragStart($event)">
                    
                    <!-- Gradient overlay to represent back of the card -->
                    <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 pointer-events-none"></div>

                    <!-- Chevron icon pointing up -->
                    <div class="animate-bounce mb-4 bg-white/10 border border-white/20 p-3 rounded-full z-20 shadow-lg backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-8 h-8 text-white drop-shadow-lg">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                    </div>
                    
                    <h2 class="text-2xl font-bold text-white text-center z-20 drop-shadow-md" [innerHTML]="'PLAY.SWIPE_TO_REVEAL' | translate"></h2>
                </div>
                
            </div>
            
            <div class="mt-8 h-16 flex flex-col justify-center w-full">
                @if (isRevealed()) {
                  <button 
                      (click)="nextPlayer()"
                      class="w-full py-4 bg-white/10 hover:bg-white/20 border border-glass-border backdrop-blur shadow-[0_0_15px_rgba(255,255,255,0.05)] text-white rounded-full font-bold text-xl active:scale-95 transition-all text-center cursor-pointer">
                      {{ isLastPlayer() ? ('PLAY.START_PLAY' | translate) : ('PLAY.NEXT_PLAYER' | translate) }}
                  </button>
                } @else {
                  <div class="text-center text-slate-500 text-sm font-semibold">
                      {{ 'PLAY.PLAYER_N_OF_M' | translate: { n: engine.currentPlayerIndex() + 1, m: engine.players().length } }}
                  </div>
                }
            </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class Play implements OnInit {
  router = inject(Router);
  engine = inject(GameEngineService);

  isRevealed = signal<boolean>(false);

  // Roulette state
  isRouletteSpinning = signal<boolean>(true);
  currentRouletteName = signal<string>('...');
  winnerName = signal<string>('');

  isLastPlayer = computed(() => {
    return this.engine.currentPlayerIndex() === this.engine.players().length - 1;
  });

  // Drag state
  isDragging = signal<boolean>(false);
  startY = signal<number>(0);
  currentY = signal<number>(0);

  // Compute the slide offset
  slideTransform = computed(() => {
    // Only allow sliding UP (negative Y)
    const slideOffset = Math.min(0, this.currentY() - this.startY());
    return 'translateY(' + slideOffset + 'px)';
  });

  ngOnInit() {
    // If we hot-reloaded and we are already in the finished phase, trigger roulette
    if (this.engine.isRevealPhaseFinished() && !this.winnerName()) {
      this.startRoulette();
    }
  }

  onDragStart(event: MouseEvent | TouchEvent) {
    this.isDragging.set(true);

    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    this.startY.set(clientY);
    this.currentY.set(clientY);
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging()) return;

    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    this.currentY.set(clientY);
  }

  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:touchend', ['$event'])
  onDragEnd(event: MouseEvent | TouchEvent) {
    if (!this.isDragging()) return;
    this.isDragging.set(false);

    const deltaY = this.currentY() - this.startY();

    // Threshold to reveal (e.g. 150px upwards)
    if (deltaY < -120) {
      this.isRevealed.set(true);
    }

    // Always snap back to original position to hide the word again
    this.startY.set(0);
    this.currentY.set(0);
  }

  nextPlayer() {
    this.isRevealed.set(false);
    this.engine.nextPlayer();

    if (this.engine.isRevealPhaseFinished()) {
      this.startRoulette();
    }
  }

  startRoulette() {
    const players = this.engine.players();
    if (!players || players.length === 0) return;

    this.isRouletteSpinning.set(true);
    const startingId = this.engine.startingPlayerId();
    const winnerIndex = players.findIndex(p => p.id === startingId);
    if (winnerIndex !== -1) {
      this.winnerName.set(players[winnerIndex].name);
    } else {
      // Fallback
      const randomFallback = Math.floor(Math.random() * players.length);
      this.winnerName.set(players[randomFallback].name);
    }

    let spins = 0;
    const maxSpins = 25; // number of random names shown before stopping

    const spin = () => {
      const randIdx = Math.floor(Math.random() * players.length);
      this.currentRouletteName.set(players[randIdx].name);
      spins++;

      if (spins < maxSpins) {
        // As spins increases, the timeout duration increases (slows down)
        setTimeout(spin, 40 + (spins * 6));
      } else {
        // Finish
        this.currentRouletteName.set(this.winnerName());
        this.isRouletteSpinning.set(false);
      }
    };

    spin();
  }

  goToVote() {
    this.router.navigate(['/vote']);
  }
}
