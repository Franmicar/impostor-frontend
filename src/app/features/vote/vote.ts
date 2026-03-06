import { Component, inject, signal, computed, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GameEngineService, Player } from '../../core/services/game-engine/game-engine';
import { TimerService } from '../../core/services/timer/timer.service';

@Component({
  selector: 'app-vote',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-transparent text-slate-50 flex flex-col items-center justify-start p-6 relative">
      
      <!-- DRAWING MODAL -->
      @if (showDrawingModal) {
        <div class="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <div class="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                @if (engine.drawings().length > 1) {
                    <button *ngIf="currentDrawingIndex > 0" (click)="prevDrawing($event)" class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white backdrop-blur transition-colors z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    </button>
                    <button *ngIf="currentDrawingIndex < engine.drawings().length - 1" (click)="nextDrawing($event)" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white backdrop-blur transition-colors z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>
                    <!-- Indicators -->
                    <div class="absolute bottom-4 left-0 right-0 gap-2 flex justify-center z-10">
                        @for (d of engine.drawings(); track $index) {
                            <div class="w-2.5 h-2.5 rounded-full shadow-sm transition-colors" [class.bg-white]="currentDrawingIndex === $index" [class.bg-white/40]="currentDrawingIndex !== $index"></div>
                        }
                    </div>
                }
                <img [src]="engine.drawings()[currentDrawingIndex]" class="w-full h-auto bg-white" alt="Final Drawing">
                <button (click)="closeDrawingModal()" class="absolute top-4 right-4 w-10 h-10 bg-slate-900/50 hover:bg-slate-900/80 rounded-full flex items-center justify-center text-white backdrop-blur transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <button (click)="closeDrawingModal()" class="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-bold tracking-widest uppercase transition-colors">
                {{ 'VOTE.CLOSE_DRAWING' | translate }}
            </button>
        </div>
      }

      <!-- DRAW AGAIN MODAL -->
      @if (showDrawAgainModal) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div class="bg-glass backdrop-blur-2xl border border-glass-border rounded-3xl p-8 max-w-sm w-full shadow-[0_0_30px_rgba(255,255,255,0.05)] flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10 text-primary">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                </div>
                <h3 class="text-2xl font-black text-white mb-2 uppercase tracking-widest">{{ 'VOTE.DRAW_AGAIN_TITLE' | translate }}</h3>
                <p class="text-slate-300 text-lg mb-8">{{ 'VOTE.DRAW_AGAIN_DESC' | translate }}</p>
                <div class="flex flex-col gap-3 w-full">
                    <button (click)="resumeDrawing(true)" class="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold transition-all shadow-md active:scale-95 uppercase tracking-widest cursor-pointer">
                        {{ 'VOTE.RESUME_DRAWING' | translate }}
                    </button>
                    <button (click)="resumeDrawing(false)" class="w-full py-4 bg-white/10 hover:bg-white/20 border border-glass-border text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 uppercase tracking-widest cursor-pointer">
                        {{ 'VOTE.BLANK_CANVAS' | translate }}
                    </button>
                    <button (click)="closeDrawAgainModal()" class="w-full mt-2 py-3 bg-transparent text-slate-400 hover:text-white rounded-xl font-bold transition-colors uppercase cursor-pointer">
                        {{ 'VOTE.CANCEL' | translate }}
                    </button>
                </div>
            </div>
        </div>
      }

      <!-- IMPOSTOR ELIMINATED MODAL -->
      @if (showImpostorEliminatedModal) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div class="bg-glass backdrop-blur-2xl border-2 border-primary rounded-3xl p-8 max-w-sm w-full shadow-[0_0_30px_rgba(242,13,185,0.3)] flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10 text-pink-500">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 class="text-2xl font-black text-pink-400 mb-2 uppercase tracking-widest">{{ 'VOTE.IMPOSTOR_CAUGHT' | translate }}</h3>
                <p class="text-slate-300 text-lg mb-8" [innerHTML]="'VOTE.IMPOSTOR_CAUGHT_DESC' | translate: { name: '<span class=\\'font-bold text-primary drop-shadow-md\\'>' + eliminatedImpostorName + '</span>' }">
                </p>
                <button (click)="closeImpostorModal()" class="w-full py-4 bg-white/10 hover:bg-white/20 border border-glass-border text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 uppercase tracking-widest cursor-pointer">
                    {{ 'VOTE.CONTINUE' | translate }}
                </button>
            </div>
        </div>
      }
      
      <!-- INNOCENT ELIMINATED MODAL -->
      @if (showCivilianEliminatedModal) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div class="bg-glass backdrop-blur-2xl border border-glass-border rounded-3xl p-8 max-w-sm w-full shadow-[0_0_30px_rgba(255,255,255,0.05)] flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div class="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10 text-secondary">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 class="text-2xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-sm">{{ 'VOTE.ELIMINATED' | translate }}</h3>
                <div class="text-slate-300 text-lg mb-8 text-center">
                   @if (eliminationReason === 'guess') {
                       <span [innerHTML]="'VOTE.DETECTIVE_FAILED' | translate: { name: '<span class=\\'font-bold text-secondary\\'>' + eliminatedCivilianName + '</span>' }"></span>
                   } @else {
                       <span [innerHTML]="'VOTE.CIVIL_ELIMINATED' | translate: { name: '<span class=\\'font-bold text-secondary\\'>' + eliminatedCivilianName + '</span>' }"></span>
                   }
                </div>
                <button (click)="closeModal()" class="w-full py-4 bg-white/10 hover:bg-white/20 border border-glass-border text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 uppercase tracking-widest cursor-pointer">
                    {{ 'VOTE.CONTINUE' | translate }}
                </button>
            </div>
        </div>
      }

      <!-- DETECTIVE GUESS MODAL -->
      @if (showDetectiveModal) {
        <div class="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
            <div class="bg-glass backdrop-blur-2xl border border-indigo-500/50 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_30px_rgba(99,102,241,0.3)] flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <h3 class="text-2xl font-black text-indigo-400 mb-4 uppercase tracking-widest text-center drop-shadow-sm">{{ 'VOTE.SOLVE_MYSTERY' | translate }}</h3>
                
                @if (aliveDetectives().length > 1) {
                    <select [(ngModel)]="selectedDetectiveId" class="w-full bg-black/30 border border-glass-border rounded-lg p-3 text-white outline-none focus:border-indigo-500 mb-4 backdrop-blur">
                        <option [ngValue]="null" disabled selected>{{ 'VOTE.WHICH_DETECTIVE' | translate }}</option>
                        @for (det of aliveDetectives(); track det.id) {
                            <option [ngValue]="det.id">{{ det.name }}</option>
                        }
                    </select>
                }

                <div class="relative w-full mb-6">
                    <input type="text" [(ngModel)]="detectiveGuess" list="packWordsModal" [placeholder]="'VOTE.SECRET_WORD_PH' | translate" class="w-full bg-black/30 border border-glass-border rounded-lg p-3 text-white outline-none focus:border-indigo-500 backdrop-blur" [disabled]="aliveDetectives().length > 1 && !selectedDetectiveId">
                    <datalist id="packWordsModal">
                        @for (w of engine.currentSettings()?.words; track w.word) {
                            <option [value]="w.word">{{ w.word }}</option>
                        }
                    </datalist>
                </div>

                <div class="flex flex-col w-full gap-3">
                    <button 
                        (click)="submitDetectiveGuess()"
                        [disabled]="(aliveDetectives().length > 1 && !selectedDetectiveId) || !detectiveGuess.trim()"
                        class="w-full py-4 bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-500/50 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95 uppercase disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed cursor-pointer">
                        {{ 'VOTE.GUESS_BTN' | translate }}
                    </button>
                    <button (click)="closeDetectiveModal()" class="w-full py-3 bg-transparent text-slate-400 hover:text-white rounded-xl font-bold transition-colors uppercase cursor-pointer">
                        {{ 'VOTE.CANCEL' | translate }}
                    </button>
                </div>
            </div>
            
            <p class="mt-6 text-sm text-center text-slate-400 max-w-xs font-medium">{{ 'VOTE.DETECTIVE_FAIL_WARN' | translate }}</p>
        </div>
      }

      <!-- HEADER & TIMER -->
      <header class="w-full max-w-md flex flex-col items-center mt-4 mb-8">
        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgba(242,13,185,0.4)] mb-4 text-center">{{ 'VOTE.TITLE' | translate }}</h2>
        
        @if (timer.isActive() || timer.timeLeftInSeconds() > 0) {
          <div class="bg-glass backdrop-blur-xl border border-glass-border px-8 py-4 rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.05)] flex flex-col items-center transition-colors"
               [class.border-primary]="timer.timeLeftInSeconds() <= 30 && timer.timeLeftInSeconds() > 0"
               [class.text-primary]="timer.timeLeftInSeconds() <= 30 && timer.timeLeftInSeconds() > 0"
               [class.border-red-500]="timer.timeLeftInSeconds() === 0"
               [class.text-red-500]="timer.timeLeftInSeconds() === 0">
            <span class="text-5xl font-black font-mono tracking-wider drop-shadow-md">{{ timer.formattedTime() }}</span>
            <span class="text-xs uppercase tracking-widest font-bold mt-1 text-slate-500">{{ 'VOTE.TIME_REMAINING' | translate }}</span>
            
            <div class="flex gap-4 mt-4">
               <button *ngIf="timer.isActive()" (click)="timer.pause()" class="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition backdrop-blur text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
               </button>
               <button *ngIf="!timer.isActive() && timer.timeLeftInSeconds() > 0" (click)="timer.resume()" class="w-10 h-10 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center hover:bg-secondary/40 transition backdrop-blur text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
               </button>
            </div>
          </div>
        } @else {
          <div class="bg-glass backdrop-blur-xl border border-glass-border px-8 py-4 rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.05)] text-center">
            <span class="text-xl font-bold text-slate-300 drop-shadow-sm">{{ 'VOTE.NO_TIME_LIMIT' | translate }}</span>
          </div>
        }

        <!-- Ver dibujo button -->
        @if (engine.currentSettings()?.gameTypeId === 'draw' && engine.drawings().length > 0) {
            <div class="flex flex-wrap justify-center gap-3 mt-4">
                <button (click)="openDrawingModal()" class="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    {{ 'VOTE.VIEW_DRAWING' | translate }}
                </button>
                <button (click)="openDrawAgainModal()" class="px-6 py-2 bg-gradient-to-r from-primary to-secondary border border-transparent hover:brightness-110 text-white rounded-full font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                    {{ 'VOTE.DRAW_AGAIN' | translate }}
                </button>
            </div>
        }
      </header>

      <!-- ALIVE PLAYERS TO VOTE -->
      <main class="w-full max-w-md flex-1 overflow-y-auto pb-36">
        <!-- VOTE_INSTRUCTION is omitted from dictionary but fine omitted here temporarily or replaced with general terms -->
        
        <div class="grid grid-cols-2 gap-4 pt-4 px-2">
          @for (player of engine.alivePlayers(); track player.id) {
            <div 
              (click)="selectedPlayerId = player.id"
              class="bg-glass backdrop-blur-md border rounded-2xl p-4 flex flex-col items-center gap-3 transition-all shadow-lg cursor-pointer hover:shadow-[0_0_20px_rgba(242,13,185,0.3)] hover:-translate-y-1"
              [class.border-primary]="selectedPlayerId === player.id"
              [class.bg-white/10]="selectedPlayerId === player.id"
              [class.shadow-[0_0_25px_rgba(242,13,185,0.5)]]="selectedPlayerId === player.id"
              [class.border-glass-border]="selectedPlayerId !== player.id"
              [class.hover:border-white/20]="selectedPlayerId !== player.id">
              <div class="w-14 h-14 rounded-full flex items-center justify-center border transition-all overflow-hidden relative"
                   [class.bg-primary/20]="selectedPlayerId === player.id"
                   [class.border-primary]="selectedPlayerId === player.id"
                   [class.bg-white/5]="selectedPlayerId !== player.id"
                   [class.border-white/10]="selectedPlayerId !== player.id">
                @if (player.photoUrl) {
                  <img [src]="player.photoUrl" class="w-full h-full object-cover">
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 transition-colors"
                       [class.text-primary]="selectedPlayerId === player.id"
                       [class.text-slate-400]="selectedPlayerId !== player.id">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                }
              </div>
              <span class="font-bold text-slate-200">{{ player.name }}</span>
            </div>
          }
        </div>
      </main>

      <!-- BOTTOM ACTIONS -->
      <footer class="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pt-12 flex flex-col gap-3 items-center">
        <!-- Votar button -->
        <button 
            (click)="eliminate()"
            [disabled]="!selectedPlayerId"
            class="w-full max-w-md py-4 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-full font-bold text-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-95 transition-all text-center disabled:opacity-50 disabled:shadow-none disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest">
            {{ 'VOTE.ELIMINATE' | translate }}
        </button>

        <!-- Detective Guess Block -->
        @if (engine.currentSettings()?.modeId === 'detective' && aliveDetectives().length > 0) {
           <button 
              (click)="openDetectiveModal()"
              class="w-full max-w-md py-4 bg-glass backdrop-blur-md text-indigo-400 border border-indigo-400/50 rounded-full font-bold hover:bg-white/10 active:scale-95 transition-all text-center mt-2 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] tracking-widest uppercase">
              {{ 'VOTE.DETECTIVE_WANTS_GUESS' | translate }}
          </button>
        }
      </footer>

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
export class Vote implements OnInit {
  engine = inject(GameEngineService);
  timer = inject(TimerService);
  router = inject(Router);

  selectedPlayerId: number | null = null;

  showCivilianEliminatedModal = false;
  showDetectiveModal = false;
  showImpostorEliminatedModal = false;
  showDrawingModal = false;
  showDrawAgainModal = false;
  eliminatedCivilianName = '';
  eliminatedImpostorName = '';
  eliminationReason: 'vote' | 'guess' = 'vote';
  wasTimerActiveBeforeModal = false;

  selectedDetectiveId: number | null = null;
  detectiveGuess: string = '';
  currentDrawingIndex: number = 0;

  aliveDetectives = computed(() => {
    return this.engine.alivePlayers().filter(p => p.isDetective);
  });

  translate = inject(TranslateService);

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Check if the game is still active logic could go here, but since vote is an active game state, always warn
    $event.returnValue = this.translate.instant('CONFIRM.MESSAGE');
  }

  ngOnInit() {
    // Start timer only if it's the first time visiting the vote screen, or read from settings
    if (!this.timer.isActive() && this.timer.timeLeftInSeconds() === 0) {
      const durationStr = this.engine.currentSettings()?.duration || '5';
      const durationNum = parseInt(durationStr, 10);
      if (durationNum > 0) {
        this.timer.start(durationNum);
      }
    }
  }

  eliminate() {
    if (!this.selectedPlayerId) return;

    const player = this.engine.alivePlayers().find(p => p.id === this.selectedPlayerId);
    if (!player) return;

    this.engine.eliminatePlayer(player.id);
    this.selectedPlayerId = null; // Reset selection

    const gameEnded = this.checkWinConditions();

    if (!gameEnded && this.engine.currentSettings()?.modeId === 'fast') {
      // In fast mode, if the game didn't end implies the impostor was NOT voted out. Fast mode is sudden death.
      this.timer.stop();
      this.router.navigate(['/results'], { queryParams: { winner: 'impostors' }, state: { intentional: true } });
      return;
    }

    if (!gameEnded) {
      if (!player.isImpostor) {
        this.eliminatedCivilianName = player.name;
        this.eliminationReason = 'vote';
        this.showCivilianEliminatedModal = true;
      } else {
        this.eliminatedImpostorName = player.name;
        this.showImpostorEliminatedModal = true;
      }
      this.wasTimerActiveBeforeModal = this.timer.isActive();
      if (this.wasTimerActiveBeforeModal) {
        this.timer.pause();
      }
    }
  }

  closeModal() {
    this.showCivilianEliminatedModal = false;
    if (this.wasTimerActiveBeforeModal && this.timer.timeLeftInSeconds() > 0) {
      this.timer.resume();
    }
  }

  closeImpostorModal() {
    this.showImpostorEliminatedModal = false;
    if (this.wasTimerActiveBeforeModal && this.timer.timeLeftInSeconds() > 0) {
      this.timer.resume();
    }
  }

  openDetectiveModal() {
    this.wasTimerActiveBeforeModal = this.timer.isActive();
    if (this.wasTimerActiveBeforeModal) {
      this.timer.pause();
    }
    this.showDetectiveModal = true;
  }

  closeDetectiveModal() {
    this.showDetectiveModal = false;
    this.detectiveGuess = '';
    this.selectedDetectiveId = null;
    if (this.wasTimerActiveBeforeModal && this.timer.timeLeftInSeconds() > 0) {
      this.timer.resume();
    }
  }

  openDrawingModal() {
    this.wasTimerActiveBeforeModal = this.timer.isActive();
    if (this.wasTimerActiveBeforeModal) {
      this.timer.pause();
    }
    this.currentDrawingIndex = this.engine.drawings().length - 1;
    this.showDrawingModal = true;
  }

  closeDrawingModal() {
    this.showDrawingModal = false;
    if (this.wasTimerActiveBeforeModal && this.timer.timeLeftInSeconds() > 0) {
      this.timer.resume();
    }
  }

  nextDrawing(e: MouseEvent) {
    e.stopPropagation();
    if (this.currentDrawingIndex < this.engine.drawings().length - 1) {
      this.currentDrawingIndex++;
    }
  }

  prevDrawing(e: MouseEvent) {
    e.stopPropagation();
    if (this.currentDrawingIndex > 0) {
      this.currentDrawingIndex--;
    }
  }

  openDrawAgainModal() {
    this.wasTimerActiveBeforeModal = this.timer.isActive();
    if (this.wasTimerActiveBeforeModal) {
      this.timer.pause();
    }
    this.showDrawAgainModal = true;
  }

  closeDrawAgainModal() {
    this.showDrawAgainModal = false;
    if (this.wasTimerActiveBeforeModal && this.timer.timeLeftInSeconds() > 0) {
      this.timer.resume();
    }
  }

  resumeDrawing(keepDrawing: boolean) {
    this.timer.stop();
    this.closeDrawAgainModal();
    this.router.navigate(['/draw'], { state: { resume: keepDrawing, intentional: true } });
  }

  submitDetectiveGuess() {
    if (!this.detectiveGuess.trim()) return;

    const detId = this.selectedDetectiveId || this.aliveDetectives()[0]?.id;
    const det = this.aliveDetectives().find(d => d.id === detId);
    if (!det) return;

    const secretWord = this.engine.secretWord()?.word;
    if (!secretWord) return;

    const guessCorrect = this.detectiveGuess.trim().toLowerCase() === secretWord.toLowerCase();

    if (guessCorrect) {
      this.timer.stop();
      this.router.navigate(['/results'], {
        queryParams: { winner: 'town', reason: 'guess', guess: this.detectiveGuess.trim(), detectiveId: det.id },
        state: { intentional: true }
      });
    } else {
      // Fails: Eliminate detective
      this.engine.eliminatePlayer(det.id);
      this.showDetectiveModal = false;
      this.detectiveGuess = '';
      this.selectedDetectiveId = null;

      const gameEnded = this.checkWinConditions();
      if (!gameEnded) {
        this.eliminatedCivilianName = det.name;
        this.eliminationReason = 'guess';
        // Give feedback immediately so players know why he was eliminated
        this.showCivilianEliminatedModal = true;
        // Note: timer state is handled by the civilian elimination modal
      }
    }
  }

  checkWinConditions(): boolean {
    const alivePlayers = this.engine.alivePlayers();
    const aliveImpostors = alivePlayers.filter(p => p.isImpostor).length;
    const aliveTownies = alivePlayers.length - aliveImpostors;
    const originalImpostors = this.engine.players().filter(p => p.isImpostor).length;
    const aliveDetectives = alivePlayers.filter(p => p.isDetective).length;

    const modeId = this.engine.currentSettings()?.modeId;
    const totalOriginalPlayers = this.engine.players().length;
    const eliminations = this.engine.eliminationsCount();

    if (modeId === 'chaos') {
      if (originalImpostors === 0) {
        if (eliminations >= 1) {
          this.timer.stop();
          this.router.navigate(['/results'], { queryParams: { winner: 'town' }, state: { intentional: true } });
          return true;
        }
        return false;
      }

      if (originalImpostors === totalOriginalPlayers) {
        if (eliminations >= 2) {
          this.timer.stop();
          this.router.navigate(['/results'], { queryParams: { winner: 'impostors' }, state: { intentional: true } });
          return true;
        }
        return false;
      }

      // Any other chaos combination plays out normally but ignoring the "impostors >= townies" rule
      if (aliveImpostors === 0) {
        this.timer.stop();
        this.router.navigate(['/results'], { queryParams: { winner: 'town' }, state: { intentional: true } });
        return true;
      }
      if (aliveTownies === 0) {
        this.timer.stop();
        this.router.navigate(['/results'], { queryParams: { winner: 'impostors' }, state: { intentional: true } });
        return true;
      }

      // Do NOT end game just because aliveImpostors >= aliveTownies in chaos mode. Force them to play all out!
      return false;
    }

    if (originalImpostors === 0) {
      // If there are exactly 0 impostors, civilians just need to survive until detectives eliminate themselves or are voted out.
      if (aliveDetectives === 0) {
        this.timer.stop();
        this.router.navigate(['/results'], { queryParams: { winner: 'town' }, state: { intentional: true } });
        return true;
      }
      return false;
    }

    if (aliveImpostors === 0) {
      this.timer.stop();
      // Pueblo gana
      this.router.navigate(['/results'], { queryParams: { winner: 'town' }, state: { intentional: true } });
      return true;
    } else if (aliveImpostors >= aliveTownies) {
      this.timer.stop();
      // Impostor(es) ganan por paridad
      this.router.navigate(['/results'], { queryParams: { winner: 'impostors' }, state: { intentional: true } });
      return true;
    } else {
      // Continue game
      return false;
    }
  }
}
