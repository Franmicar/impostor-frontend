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
           <h2 class="text-2xl font-bold text-slate-100 mb-6 tracking-widest uppercase text-center drop-shadow-md">
               {{ (isRouletteSpinning() ? 'PLAY.DECIDING_TURN' : 'PLAY.STARTS') | translate }}
           </h2>
           
           <!-- ROULETTE WHEEL (Always visible after reveal phase) -->
           <!-- Enlarged from max-w-[280px] to max-w-[340px] for better name visibility -->
           <div class="relative flex justify-center items-center w-full max-w-[340px] md:max-w-[400px] aspect-square mx-auto mb-8">
              <!-- The Wheel -->
              <div class="w-full h-full rounded-full overflow-hidden border-[8px] border-slate-800 shadow-[0_0_40px_rgba(242,13,185,0.5)]"
                   [style.transform]="'rotate(' + currentWheelRotation() + 'deg)'"
                   [style.transition-property]="'transform'"
                   [style.transition-duration]="spinDuration() + 'ms'"
                   [style.transition-timing-function]="'cubic-bezier(0.15, 0.85, 0.15, 1)'"
                   [style.background]="wheelGradient()">
                  @for (p of engine.players(); track p.id; let i = $index) {
                     <div class="absolute top-[calc(50%-14px)] left-1/2 w-1/2 h-[28px] origin-left flex items-center justify-end pr-6 text-white font-bold tracking-wider drop-shadow-md z-10"
                          [style.transform]="'rotate(' + ((i + 0.5) * (360 / engine.players().length) - 90) + 'deg)'">
                         <span class="truncate max-w-[140px]" style="font-size: 1.6rem;">{{ p.name }}</span>
                     </div>
                  }
              </div>
              
              <!-- Center dot -->
              <div class="absolute w-12 h-12 inset-0 m-auto bg-slate-800 rounded-full border-[4px] border-slate-600 shadow-2xl z-20 flex justify-center items-center">
                  <div class="w-5 h-5 rounded-full bg-slate-900 shadow-inner"></div>
              </div>
              
              <!-- Pointer at RIGHT edge pointing LEFT -->
              <div class="absolute right-[-20px] inset-y-0 my-auto w-0 h-0 border-y-[20px] border-y-transparent border-r-[40px] border-r-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] z-30 pointer-events-none"></div>
           </div>
           
           <!-- Continue Form Only When Stopped -->
           <div class="w-full flex flex-col items-center min-h-[100px] justify-center transition-opacity duration-500 delay-300" [class.opacity-0]="isRouletteSpinning()" [class.pointer-events-none]="isRouletteSpinning()">
              
              <!-- Added the Starts Speaking layout above the name -->
              <span class="text-slate-300 uppercase tracking-widest text-xs font-bold mb-2">{{ 'PLAY.STARTS' | translate }}</span>
              <h2 class="text-4xl font-black text-secondary text-center mb-6 drop-shadow-[0_0_15px_rgba(13,242,242,0.6)]">{{ winnerName() }}</h2>
              
              <button 
                (click)="goToVote()" 
                class="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-xl shadow-[0_0_20px_rgba(242,13,185,0.4)] hover:shadow-[0_0_30px_rgba(13,242,242,0.5)] active:scale-95 transition-all text-center">
                {{ 'PLAY.PLAY_BTN' | translate }}
              </button>
           </div>
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
                    class="absolute inset-0 w-full h-full bg-slate-900 border border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-grab active:cursor-grabbing z-10 transition-transform select-none"
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
  currentWheelRotation = signal<number>(0);
  spinDuration = signal<number>(0);
  winnerName = signal<string>('');

  wheelGradient = computed(() => {
    const players = this.engine.players();
    const n = players.length;
    if (n === 0) return '';
    const sliceAngle = 360 / n;
    // Cool, vibrant UI palette matching the app (pink, cyan, purple, orange, green, blue)
    const colors = ['#ec4899', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#d946ef'];

    let gradient = 'conic-gradient(';
    for (let i = 0; i < n; i++) {
      const color = colors[i % colors.length];
      const start = i * sliceAngle;
      const end = (i + 1) * sliceAngle;
      // Adding a slight border hack in the gradient isn't trivial, but simple blocks works perfectly
      gradient += `${color} ${start}deg ${end}deg`;
      if (i < n - 1) gradient += ', ';
    }
    gradient += ')';
    return gradient;
  });

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
    const winnerIndex = Math.max(0, players.findIndex(p => p.id === startingId));
    this.winnerName.set(players[winnerIndex].name);

    // Normalize rotation without animation
    const currentNorm = this.currentWheelRotation() % 360;
    this.spinDuration.set(0);
    this.currentWheelRotation.set(currentNorm);

    // Give DOM a frame to snap to 0-360 before applying the huge transition
    setTimeout(() => {
      const sliceAngle = 360 / players.length;
      // Pointer is at RIGHT (which is 90 from top). Align winner's slice center to pointer.
      const baseTarget = 90 - (winnerIndex + 0.5) * sliceAngle;

      // Final spin adds 5 full rotations (1800 deg)
      const finalSpin = baseTarget + 360 * 5;

      this.spinDuration.set(4000); // 4 seconds spin
      this.currentWheelRotation.set(finalSpin);

      setTimeout(() => {
        this.isRouletteSpinning.set(false);
      }, 4200); // Add 200ms padding
    }, 50);
  }

  goToVote() {
    this.router.navigate(['/vote']);
  }
}
