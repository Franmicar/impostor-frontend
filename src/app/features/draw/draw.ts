import { Component, inject, signal, computed, ViewChild, ElementRef, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GameEngineService } from '../../core/services/game-engine/game-engine';

@Component({
    selector: 'app-draw',
    standalone: true,
    imports: [TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-between p-4 overflow-hidden relative">
      <!-- Background elements for style -->
      <div class="absolute inset-0 z-0 bg-transparent bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

      <!-- Main Game Area -->
      @if (!engine.gameStarted()) {
        <div class="z-10 flex flex-col items-center justify-center gap-4 h-full">
            <p>{{ 'DRAW.NO_ACTIVE_GAME' | translate }}</p>
            <button (click)="router.navigate(['/setup'])" class="text-primary underline">{{ 'DRAW.BACK_TO_SETUP' | translate }}</button>
        </div>
      } @else {
        
        <!-- HEADER -->
        <div class="z-10 w-full max-w-lg mb-4 flex flex-col items-center gap-2 mt-2">
            <div class="flex items-center justify-between w-full">
                <!-- Current Player Info -->
                <div class="flex flex-col">
                    <span class="text-xs uppercase tracking-widest text-slate-400 font-bold">{{ 'DRAW.CURRENT_PLAYER' | translate }}</span>
                    <h2 class="text-2xl font-black text-white drop-shadow-md">{{ currentPlayerDrawing()?.name }}</h2>
                </div>

                <!-- Timer -->
                <div class="flex flex-col items-end">
                    <span class="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">{{ 'DRAW.TIME_LEFT' | translate }}</span>
                    <div class="relative w-14 h-14 flex items-center justify-center bg-glass border border-glass-border rounded-full shadow-[0_0_15px_rgba(242,13,185,0.2)]">
                        <span class="text-2xl font-black" [class.text-red-500]="timeLeft() <= 3" [class.text-white]="timeLeft() > 3" [class.animate-pulse]="timeLeft() <= 3">
                            {{ timeLeft() }}
                        </span>
                        <!-- Circle Progress -->
                        <svg class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 56 56" style="overflow: visible;">
                            <circle cx="28" cy="28" r="25" fill="transparent" stroke="rgba(255,255,255,0.1)" stroke-width="4"/>
                            <circle cx="28" cy="28" r="25" fill="transparent" stroke="currentColor" stroke-width="4"
                                    class="transition-all duration-1000 ease-linear"
                                    [class.text-primary]="timeLeft() > 3" [class.text-red-500]="timeLeft() <= 3"
                                    [style.stroke-dasharray]="157" 
                                    [style.stroke-dashoffset]="157 - (157 * (timeLeft() / maxTime()))"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div class="h-full bg-gradient-to-r from-primary to-secondary transition-all" [style.width.%]="(drawTurnCount() + 1) / engine.players().length * 100"></div>
            </div>
        </div>

        <!-- CANVAS & TOOLS AREA -->
        <div class="z-10 w-full max-w-lg flex-1 flex flex-row gap-4 mb-6 relative">
            <!-- Toolbox on the left -->
            @if(!isDrawingPhaseFinished()) {
              <div class="flex flex-col gap-3 z-30 shrink-0 mt-4">
                  <button (click)="undo()" 
                          [disabled]="!isCurrentPlayerTurn()"
                          [class.opacity-50]="!isCurrentPlayerTurn()"
                          class="w-12 h-12 rounded-full bg-slate-800 shadow-md flex items-center justify-center text-white active:scale-95 transition-all border border-slate-600 disabled:cursor-not-allowed">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                  </button>
                  
                  <div class="relative">
                      <button (click)="isPaletteOpen = !isPaletteOpen" class="w-12 h-12 rounded-full shadow-md flex items-center justify-center border-2 border-slate-600 active:scale-95 transition-transform" [style.backgroundColor]="currentColor">
                      </button>
                      
                      <!-- Color Palette Dropdown -->
                      @if(isPaletteOpen) {
                          <div class="absolute top-14 left-0 bg-slate-800 border border-slate-600 rounded-2xl p-2 shadow-xl flex flex-col gap-2 z-40">
                              @for(color of availableColors; track color) {
                                  <div (click)="setColor(color)" class="w-8 h-8 rounded-full cursor-pointer hover:scale-110 shadow-sm border border-black/20 transition-transform" [style.backgroundColor]="color"></div>
                              }
                          </div>
                      }
                  </div>
              </div>
            }

            <!-- Interacive Canvas -->
            <div class="flex-1 bg-white rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative border-[4px] border-slate-700 min-h-[300px]">
                <canvas #drawCanvas 
                        class="w-full h-full touch-none"
                        [class.pointer-events-none]="!isCurrentPlayerTurn()"
                        (mousedown)="startDrawing($event)"
                        (mousemove)="draw($event)"
                        (mouseup)="stopDrawing()"
                        (mouseleave)="stopDrawing()"
                        (touchstart)="startDrawingTouch($event)"
                        (touchmove)="drawTouch($event)"
                        (touchend)="stopDrawingTouch()"
                        (touchcancel)="stopDrawingTouch()">
                </canvas>

                <!-- Turn Block Overlay (prevents drawing when not your turn, e.g. handing over phone) -->
                @if (!isCurrentPlayerTurn()) {
                    <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                        <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-white">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                            </svg>
                        </div>
                        @if (isDrawingPhaseFinished()) {
                            <h3 class="text-2xl font-bold text-white mb-2">{{ 'DRAW.ALL_DONE' | translate }}</h3>
                            <p class="text-slate-300">{{ 'DRAW.ALL_DONE_DESC' | translate }}</p>
                        } @else {
                            <h3 class="text-2xl font-bold text-white mb-2">{{ 'DRAW.PASS_DEVICE_TO' | translate: { name: currentPlayerDrawing()?.name } }}</h3>
                            <p class="text-slate-300 mb-6">{{ 'DRAW.READY_TO_DRAW' | translate: { time: maxTime() } }}</p>
                            
                            <button (click)="startTurn()" class="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-lg hover:shadow-primary/50 transition-all active:scale-95">
                                {{ 'DRAW.START_MY_TURN' | translate }}
                            </button>
                        }
                    </div>
                }
            </div>
        </div>

        <!-- CONTROLS & NEXT BUTTON -->
        <div class="z-10 w-full max-w-lg pb-4">
            @if (!isDrawingPhaseFinished()) {
                <button 
                  (click)="passTurn()" 
                  [disabled]="!isCurrentPlayerTurn()"
                  class="w-full py-4 bg-glass border border-glass-border backdrop-blur shadow-[0_0_15px_rgba(255,255,255,0.05)] text-white rounded-full font-bold text-xl active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none">
                  {{ 'DRAW.PASS_TURN' | translate }}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
                  </svg>
                </button>
            } @else {
                <button 
                  (click)="goToVote()" 
                  class="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-xl shadow-[0_0_20px_rgba(242,13,185,0.4)] hover:shadow-[0_0_30px_rgba(13,242,242,0.5)] active:scale-95 transition-all text-center">
                  {{ 'DRAW.GO_TO_VOTE' | translate }}
                </button>
            }
        </div>
      }
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overscroll-behavior-y: none; /* prevent pull-to-refresh on mobile while drawing */
    }
  `]
})
export class DrawComponent implements AfterViewInit, OnDestroy {
    router = inject(Router);
    engine = inject(GameEngineService);
    translate = inject(TranslateService);

    @ViewChild('drawCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx: CanvasRenderingContext2D | null = null;

    // Drawing State
    private isDrawingCanvas = false;
    private lastX = 0;
    private lastY = 0;
    private history: ImageData[] = [];
    currentColor = '#000000'; // black

    // Basic color palette
    isPaletteOpen = false;
    availableColors = [
        '#38bdf8', // Light Blue
        '#1d4ed8', // Dark Blue
        '#ef4444', // Red
        '#22c55e', // Green
        '#eab308', // Yellow
        '#f97316', // Orange
        '#ec4899', // Pink
        '#8b4513', // Brown
        '#6b7280', // Gray
        '#000000'  // Black
    ];

    // Turn tracking and Timer
    isCurrentPlayerTurn = signal<boolean>(false);
    maxTime = computed(() => this.engine.currentSettings()?.drawTurnTime || 10);
    timeLeft = signal<number>(this.engine.currentSettings()?.drawTurnTime || 10);
    private timerInterval: any;

    drawTurnCount = signal<number>(0); // from 0 to players().length - 1

    currentPlayerDrawing = computed(() => {
        const players = this.engine.players();
        if (players.length === 0) return null;

        // Find the index of the startingPlayerId
        const startId = this.engine.startingPlayerId();
        let startIndex = players.findIndex(p => p.id === startId);
        if (startIndex === -1) startIndex = 0;

        // the current player index is (startIndex + drawTurnCount) % length
        const targetIndex = (startIndex + this.drawTurnCount()) % players.length;
        return players[targetIndex];
    });

    isDrawingPhaseFinished = computed(() => {
        return this.drawTurnCount() >= this.engine.players().length;
    });

    ngAfterViewInit() {
        if (this.engine.gameStarted() && this.canvasRef) {
            this.initCanvas();
            const state = history.state as { resume?: boolean };
            if (state.resume) {
                const drawings = this.engine.drawings();
                if (drawings.length > 0) {
                    const lastDrawing = drawings[drawings.length - 1];
                    const img = new Image();
                    img.onload = () => {
                        if (this.ctx && this.canvasRef) {
                            this.ctx.drawImage(img, 0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
                            this.saveState();
                        }
                    };
                    img.src = lastDrawing;
                }
            }
        }
    }

    ngOnDestroy() {
        this.clearTimer();
    }

    private initCanvas() {
        const canvas = this.canvasRef.nativeElement;
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            canvas.width = rect.width;
            canvas.height = rect.height;
        }

        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (this.ctx) {
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = this.currentColor;
        }
    }

    startDrawing(e: MouseEvent) {
        if (!this.isCurrentPlayerTurn() || this.isDrawingPhaseFinished()) return;
        this.saveState();
        this.isDrawingCanvas = true;
        this.updateLastPosition(e);
    }

    draw(e: MouseEvent) {
        if (!this.isDrawingCanvas || !this.ctx || !this.isCurrentPlayerTurn() || this.isDrawingPhaseFinished()) return;
        this.drawLine(e.offsetX, e.offsetY);
    }

    stopDrawing() {
        this.isDrawingCanvas = false;
    }

    startDrawingTouch(e: TouchEvent) {
        if (!this.isCurrentPlayerTurn() || this.isDrawingPhaseFinished()) return;
        e.preventDefault();
        this.saveState();
        this.isDrawingCanvas = true;
        this.updateLastPositionTouch(e.touches[0]);
    }

    drawTouch(e: TouchEvent) {
        if (!this.isDrawingCanvas || !this.ctx || !this.isCurrentPlayerTurn() || this.isDrawingPhaseFinished()) return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvasRef.nativeElement.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.drawLine(x, y);
    }

    stopDrawingTouch() {
        this.isDrawingCanvas = false;
    }

    private updateLastPosition(e: MouseEvent) {
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
    }

    private updateLastPositionTouch(touch: Touch) {
        const rect = this.canvasRef.nativeElement.getBoundingClientRect();
        this.lastX = touch.clientX - rect.left;
        this.lastY = touch.clientY - rect.top;
    }

    private drawLine(x: number, y: number) {
        if (!this.ctx) return;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        this.lastX = x;
        this.lastY = y;
    }

    undo() {
        if (this.history.length > 0 && this.ctx && this.canvasRef) {
            const imageData = this.history.pop()!;
            this.ctx.putImageData(imageData, 0, 0);
        }
    }

    setColor(color: string) {
        this.currentColor = color;
        this.isPaletteOpen = false;
        if (this.ctx) {
            this.ctx.strokeStyle = this.currentColor;
        }
    }

    private saveState() {
        if (!this.ctx || !this.canvasRef) return;
        const canvas = this.canvasRef.nativeElement;
        if (this.history.length >= 15) this.history.shift(); // Limit history space
        this.history.push(this.ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    startTurn() {
        this.isCurrentPlayerTurn.set(true);
        this.history = []; // Reset history for this player's turn
        this.timeLeft.set(this.maxTime());

        // Run timer logic safely
        let currentSeconds = this.maxTime();
        this.timerInterval = setInterval(() => {
            currentSeconds--;
            if (currentSeconds <= 0) {
                this.timeLeft.set(0);
                this.passTurn();
            } else {
                this.timeLeft.set(currentSeconds);
            }
        }, 1000);
    }

    private clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    passTurn() {
        this.isDrawingCanvas = false;
        this.isCurrentPlayerTurn.set(false);
        this.clearTimer();

        // Increment the drawing round count
        this.drawTurnCount.update(c => c + 1);
    }

    goToVote() {
        if (this.canvasRef) {
            this.engine.drawings.update(d => [...d, this.canvasRef.nativeElement.toDataURL()]);
        }
        this.router.navigate(['/vote'], { state: { intentional: true } });
    }
}
