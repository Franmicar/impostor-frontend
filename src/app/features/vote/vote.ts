import { Component, inject, signal, computed, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GameEngineService, Player } from '../../core/services/game-engine/game-engine';
import { TimerService } from '../../core/services/timer/timer.service';
import { BillingService } from '../../core/services/billing.service';
import { ButtonPrimaryComponent } from '../../shared/components/ui/button-primary.component';
import { ButtonSecondaryComponent } from '../../shared/components/ui/button-secondary.component';
import { IconButtonComponent } from '../../shared/components/ui/icon-button.component';
import { ModalComponent } from '../../shared/components/ui/modal.component';
import { HeaderComponent } from '../../shared/components/ui/header.component';
import { FooterComponent } from '../../shared/components/ui/footer.component';
import { InputComponent } from '../../shared/components/ui/input.component';
import { SocketService } from '../../core/services/socket/socket.service';

@Component({
 selector: 'app-vote',
 standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule, ButtonPrimaryComponent, ButtonSecondaryComponent, IconButtonComponent, ModalComponent, HeaderComponent, FooterComponent, InputComponent],
 template: `
  <div class="min-h-dvh bg-transparent text-textPrimary flex flex-col relative w-full">
   <app-header [showBack]="false" [title]="'VOTE.TITLE' | translate"></app-header>
   <div class="flex-1 flex flex-col items-center justify-start w-full px-6">
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
   <app-modal
     [isOpen]="showDrawAgainModal"
     [title]="'VOTE.DRAW_AGAIN_TITLE' | translate"
     (onClose)="closeDrawAgainModal()">
     
     <div modal-icon class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/50 text-primary mx-auto">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
       </svg>
     </div>
     
     <p class="text-textMuted text-lg mb-8">{{ 'VOTE.DRAW_AGAIN_DESC' | translate }}</p>
     
     <div modal-footer class="flex flex-col gap-3 w-full">
       <app-button-primary (onClick)="resumeDrawing(true)">
         {{ 'VOTE.RESUME_DRAWING' | translate }}
       </app-button-primary>
       <app-button-secondary (onClick)="resumeDrawing(false)">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
         <span>{{ 'VOTE.BLANK_CANVAS' | translate }}</span>
       </app-button-secondary>
       <app-button-secondary (onClick)="closeDrawAgainModal()">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
         <span class="uppercase tracking-widest font-bold">{{ 'VOTE.CANCEL' | translate }}</span>
       </app-button-secondary>
     </div>
   </app-modal>

   <!-- IMPOSTOR ELIMINATED MODAL -->
   <app-modal
     [isOpen]="showImpostorEliminatedModal"
     [title]="'VOTE.IMPOSTOR_CAUGHT' | translate"
     [preventCloseOutside]="true"
     (onClose)="closeImpostorModal()">
     
     <div modal-icon class="w-20 h-20 bg-primary/20 border border-primary/50 rounded-full flex items-center justify-center mb-6 mx-auto text-pink-500 shrink-0">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
       </svg>
     </div>
     
     <p class="text-textMuted text-lg mb-8" [innerHTML]="'VOTE.IMPOSTOR_CAUGHT_DESC' | translate: { name: '<span class=\\'font-bold text-primary drop-shadow-md\\'>' + eliminatedImpostorName + '</span>' }">
     </p>
     
     <app-button-primary modal-footer (onClick)="closeImpostorModal()">
       {{ 'VOTE.CONTINUE' | translate }}
     </app-button-primary>
   </app-modal>
   
   <!-- INNOCENT ELIMINATED MODAL -->
   <app-modal
     [isOpen]="showCivilianEliminatedModal"
     [title]="'VOTE.ELIMINATED' | translate"
     [preventCloseOutside]="true"
     (onClose)="closeModal()">
     
     <div modal-icon class="w-20 h-20 bg-secondary/20 border border-secondary/50 rounded-full flex items-center justify-center mb-6 mx-auto text-secondary shrink-0">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
       </svg>
     </div>
     
     <div class="text-textMuted text-lg mb-8 text-center">
       @if (eliminationReason === 'guess') {
         <span [innerHTML]="'VOTE.DETECTIVE_FAILED' | translate: { name: '<span class=\\'font-bold text-secondary\\'>' + eliminatedCivilianName + '</span>' }"></span>
       } @else {
         <span [innerHTML]="'VOTE.CIVIL_ELIMINATED' | translate: { name: '<span class=\\'font-bold text-secondary\\'>' + eliminatedCivilianName + '</span>' }"></span>
       }
     </div>
     
     <app-button-primary modal-footer (onClick)="closeModal()">
       {{ 'VOTE.CONTINUE' | translate }}
     </app-button-primary>
   </app-modal>

   <!-- DETECTIVE GUESS MODAL -->
   <app-modal
     [isOpen]="showDetectiveModal"
     [title]="'VOTE.SOLVE_MYSTERY' | translate"
     (onClose)="closeDetectiveModal()">
     
     <div class="w-full mt-2">
       @if (aliveDetectives().length > 1) {
         <select [(ngModel)]="selectedDetectiveId" class="w-full bg-glass border border-glass-border rounded-lg p-3 text-textPrimary outline-none focus:border-primary mb-4 backdrop-blur">
           <option [ngValue]="null" disabled selected>{{ 'VOTE.WHICH_DETECTIVE' | translate }}</option>
           @for (det of aliveDetectives(); track det.id) {
             <option [ngValue]="det.id">{{ det.name }}</option>
           }
         </select>
       }

        <div class="relative w-full mb-6">
          <app-input 
            [(ngModel)]="detectiveGuess" 
            list="packWordsModal" 
            [placeholder]="'VOTE.SECRET_WORD_PH' | translate" 
            [disabled]="aliveDetectives().length > 1 && !selectedDetectiveId"
            focusBorder="primary" />
          <datalist id="packWordsModal">
            @for (w of uniqueWords; track w) {
              <option [value]="w">{{ w }}</option>
            }
          </datalist>
        </div>
        
        <p class="mb-4 text-sm text-center text-textMuted max-w-xs mx-auto font-medium">{{ 'VOTE.DETECTIVE_FAIL_WARN' | translate }}</p>
      </div>

      <div modal-footer class="flex flex-col w-full gap-3">
        <app-button-primary 
          (onClick)="submitDetectiveGuess()"
          [disabled]="(aliveDetectives().length > 1 && !selectedDetectiveId) || !isGuessValid">
          {{ 'VOTE.GUESS_BTN' | translate }}
        </app-button-primary>
        <app-button-secondary (onClick)="closeDetectiveModal()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          <span class="uppercase tracking-widest font-bold">{{ 'VOTE.CANCEL' | translate }}</span>
        </app-button-secondary>
      </div>
   </app-modal>

   <!-- HEADER & TIMER & ACTIONS -->
   <div class="w-full max-w-md flex flex-col items-center mb-8">
     @if (isOnline()) {
      <div class="bg-glass backdrop-blur-xl border border-glass-border px-8 py-4 rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.05)] flex flex-col items-center transition-colors"
         [class.border-primary]="onlineTimeSeconds <= 10 && onlineTimeSeconds > 0"
         [class.text-primary]="onlineTimeSeconds <= 10 && onlineTimeSeconds > 0"
         [class.border-red-500]="onlineTimeSeconds === 0"
         [class.text-red-500]="onlineTimeSeconds === 0">
       <span class="text-5xl font-black font-mono tracking-wider drop-shadow-md">{{ onlineFormattedTime() }}</span>
       <span class="text-xs uppercase tracking-widest font-bold mt-1 text-textMuted">{{ 'VOTE.TIME_REMAINING' | translate }}</span>
      </div>
     } @else if (timer.isActive() || timer.timeLeftInSeconds() > 0) {
      <div class="bg-glass backdrop-blur-xl border border-glass-border px-8 py-4 rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.05)] flex flex-col items-center transition-colors"
         [class.border-primary]="timer.timeLeftInSeconds() <= 30 && timer.timeLeftInSeconds() > 0"
         [class.text-primary]="timer.timeLeftInSeconds() <= 30 && timer.timeLeftInSeconds() > 0"
         [class.border-red-500]="timer.timeLeftInSeconds() === 0"
         [class.text-red-500]="timer.timeLeftInSeconds() === 0">
       <span class="text-5xl font-black font-mono tracking-wider drop-shadow-md">{{ timer.formattedTime() }}</span>
       <span class="text-xs uppercase tracking-widest font-bold mt-1 text-textMuted">{{ 'VOTE.TIME_REMAINING' | translate }}</span>
       
       <div class="flex gap-4 mt-4">
         @if (timer.isActive()) {
          <app-icon-button (onClick)="timer.pause()">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
          </app-icon-button>
         } @else if (timer.timeLeftInSeconds() > 0) {
          <app-icon-button (onClick)="timer.resume()">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
          </app-icon-button>
         }
       </div>
      </div>
     } @else {
      <div class="bg-glass backdrop-blur-xl border border-glass-border px-8 py-4 rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.05)] text-center">
       <span class="text-xl font-bold text-textMuted drop-shadow-sm">{{ 'VOTE.NO_TIME_LIMIT' | translate }}</span>
      </div>
     }

     <!-- Ver dibujo button -->
     @if (engine.currentSettings()?.gameTypeId === 'draw' && engine.drawings().length > 0) {
       <div class="w-full flex flex-row flex-wrap justify-center gap-3 mt-4 px-2">
         <div class="flex-1 w-full sm:w-auto sm:min-w-[200px]" [class.w-full]="isOnline()">
          <app-button-secondary (onClick)="openDrawingModal()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
             <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span>{{ 'VOTE.VIEW_DRAWING' | translate }}</span>
          </app-button-secondary>
         </div>
         @if (!isOnline()) {
           <div class="flex-1 w-full sm:w-auto sm:min-w-[200px]">
            <app-button-secondary (onClick)="openDrawAgainModal()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              <span>{{ 'VOTE.DRAW_AGAIN' | translate }}</span>
            </app-button-secondary>
           </div>
         }
       </div>
     }
   </div>

   <!-- ALIVE PLAYERS TO VOTE -->
   <main class="w-full max-w-md flex-1">
    <div class="grid grid-cols-2 gap-4 pt-4 px-2">
      @for (player of engine.alivePlayers(); track player.id) {
       <div 
        (click)="(!isOnline() || player.id.toString() !== myPlayerId()?.toString()) && (selectedPlayerId = player.id)"
        class="bg-glass backdrop-blur-md border rounded-2xl p-4 flex flex-col items-center gap-3 transition-all shadow-lg relative"
        [class.cursor-pointer]="!isOnline() || player.id.toString() !== myPlayerId()?.toString()"
        [class.cursor-not-allowed]="isOnline() && player.id.toString() === myPlayerId()?.toString()"
        [class.opacity-60]="isOnline() && player.id.toString() === myPlayerId()?.toString()"
        [class.hover:shadow-[0_0_20px_rgb(var(--color-primary)/0.4)]]="!isOnline() || player.id.toString() !== myPlayerId()?.toString()"
        [class.hover:-translate-y-1]="!isOnline() || player.id.toString() !== myPlayerId()?.toString()"
        [class.border-primary]="selectedPlayerId === player.id"
        [class.bg-white/10]="selectedPlayerId === player.id"
        [class.shadow-[0_0_25px_rgb(var(--color-primary)/0.4)]]="selectedPlayerId === player.id"
        [class.border-glass-border]="selectedPlayerId !== player.id"
        [class.hover:border-white/20]="selectedPlayerId !== player.id">
       
       <!-- Check if player has voted -->
       @if (isOnline()) {
         <div class="absolute top-2 right-2 flex gap-1.5 items-center z-10">
           @if (hasPlayerVoted(player.id)) {
             <span class="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" title="Votado">
               ✓
             </span>
           }
           @if (getVotesForPlayer(player.id) > 0) {
             <span class="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
               {{ getVotesForPlayer(player.id) }}
             </span>
           }
         </div>
       }

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
            [class.text-textMuted]="selectedPlayerId !== player.id">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
         </svg>
        }
       </div>
       <span class="font-bold text-textPrimary text-center">
         {{ player.name }}{{ (isOnline() && player.id.toString() === myPlayerId()?.toString()) ? ' (Yo)' : '' }}
       </span>
      </div>
     }
    </div>
   </main>

   <!-- BOTTOM ACTIONS -->
   <app-footer>
    <div class="flex w-full gap-3">
     <!-- Votar button -->
     <button 
       (click)="eliminate()"
       [disabled]="!selectedPlayerId || (isOnline() && myPlayerId() && hasPlayerVoted(myPlayerId()!))"
       class="flex-1 relative group overflow-hidden py-4 px-2 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-95 transition-all text-center disabled:opacity-50 disabled:shadow-none disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest flex items-center justify-center gap-2">
       <div class="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
       <span class="relative z-10 drop-shadow-md">
         {{ (isOnline() && myPlayerId() && hasPlayerVoted(myPlayerId()!)) ? '✓' : ('VOTE.ELIMINATE' | translate) }}
       </span>
     </button>

     <!-- Detective Guess Block -->
     @if (engine.currentSettings()?.modeId === 'detective' && aliveDetectives().length > 0) {
       <button 
        (click)="openDetectiveModal()"
        class="flex-1 relative group overflow-hidden py-4 px-2 bg-glass backdrop-blur-md text-indigo-400 border border-indigo-400/50 rounded-2xl font-bold hover:bg-white/10 active:scale-95 transition-all text-center cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] tracking-widest uppercase flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <span class="relative z-10 drop-shadow-md text-lg sm:text-xl">
          {{ 'VOTE.DETECTIVE_WANTS_GUESS' | translate }}
        </span>
      </button>
     }
    </div>
   </app-footer>

    <!-- ONLINE RESOLUTION OVERLAY/MODAL -->
    @if (isOnline() && roomState()?.status === 'vote-resolved') {
      <div class="fixed inset-0 bg-black/85 z-[70] flex flex-col items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
        <div class="w-full max-w-md bg-glass border border-glass-border rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
          
          <!-- Tie / Empate -->
          @if (roomState()?.votingState?.resolution?.isTie) {
            <div class="w-20 h-20 bg-yellow-500/20 border border-yellow-500/50 rounded-full flex items-center justify-center mb-6 text-yellow-500 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-2xl font-black text-yellow-500 mb-4 tracking-widest uppercase">EMPATE</h2>
            <p class="text-textMuted text-lg mb-6">Hubo un empate en los votos. Nadie ha sido eliminado esta ronda.</p>
          }
          
          <!-- Detective guess fail -->
          @else if (roomState()?.votingState?.resolution?.isGuessFail) {
            <div class="w-20 h-20 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mb-6 text-red-500 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-black text-red-500 mb-4 tracking-widest uppercase">FALLO DE DETECTIVE</h2>
            <p class="text-textMuted text-lg mb-6">
              El detective <span class="font-bold text-red-400">{{ roomState()?.votingState?.resolution?.eliminatedPlayerName }}</span> intentó adivinar la palabra "<span class="font-bold text-white">{{ roomState()?.votingState?.resolution?.guessWord }}</span>" y falló, por lo que es eliminado.
            </p>
          }

          <!-- Player eliminated -->
          @else {
            @if (roomState()?.votingState?.resolution?.isImpostor) {
              <div class="w-20 h-20 bg-primary/20 border border-primary/50 rounded-full flex items-center justify-center mb-6 text-pink-500 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-2xl font-black text-primary mb-4 tracking-widest uppercase">IMPOSTOR CAZADO</h2>
              <p class="text-textMuted text-lg mb-6">
                ¡Bien hecho! <span class="font-bold text-primary">{{ roomState()?.votingState?.resolution?.eliminatedPlayerName }}</span> era el impostor.
              </p>
            } @else {
              <div class="w-20 h-20 bg-secondary/20 border border-secondary/50 rounded-full flex items-center justify-center mb-6 text-secondary shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-2xl font-black text-secondary mb-4 tracking-widest uppercase">CIVIL ELIMINADO</h2>
              <p class="text-textMuted text-lg mb-6">
                El jugador <span class="font-bold text-secondary">{{ roomState()?.votingState?.resolution?.eliminatedPlayerName }}</span> ha sido eliminado, pero NO era un impostor.
              </p>
            }
          }

          <!-- Countdown timer for next round -->
          <div class="mt-6 flex flex-col items-center">
            <span class="text-4xl font-mono font-black text-white/90 drop-shadow">{{ roomState()?.votingState?.resolution?.timeLeft }}s</span>
            <span class="text-xs uppercase tracking-widest font-bold mt-1 text-textMuted">Siguiente ronda en...</span>
          </div>

        </div>
      </div>
    }

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
 billing = inject(BillingService);
 socketService = inject(SocketService);

 selectedPlayerId: number | string | null = null;

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

 isOnline = computed(() => {
   return !!this.socketService.roomState();
 });

 roomState = computed(() => {
   return this.socketService.roomState();
 });

 myPlayerId = computed(() => {
   return this.socketService.myPlayerId();
 });

 hasPlayerVoted(playerId: string | number): boolean {
   const votes = this.socketService.roomState()?.votingState?.votes;
   return votes ? !!votes[playerId.toString()] : false;
 }

 getVotesForPlayer(playerId: string | number): number {
   const votes = this.socketService.roomState()?.votingState?.votes;
   if (!votes) return 0;
   return Object.values(votes).filter(v => v === playerId.toString()).length;
 }

 onlineFormattedTime(): string {
   const state = this.roomState();
   if (!state || !state.votingState) return '00:00';
   
   const isResolved = state.status === 'vote-resolved';
   const seconds = isResolved 
     ? (state.votingState.resolution?.timeLeft || 0)
     : (state.votingState.timeLeft || 0);

   const m = Math.floor(seconds / 60).toString().padStart(2, '0');
   const s = (seconds % 60).toString().padStart(2, '0');
   return `${m}:${s}`;
 }

 get onlineTimeSeconds(): number {
   const state = this.roomState();
   if (!state || !state.votingState) return 0;
   
   const isResolved = state.status === 'vote-resolved';
   return isResolved 
     ? (state.votingState.resolution?.timeLeft || 0)
     : (state.votingState.timeLeft || 0);
 }

 aliveDetectives = computed(() => {
  return this.engine.alivePlayers().filter(p => p.isDetective);
 });

 get uniqueWords(): string[] {
  const words = this.engine.currentSettings()?.words || [];
  const uniqueMap = new Map<string, string>();
  words.forEach(w => {
   const lower = w.word.toLowerCase().trim();
   if (!uniqueMap.has(lower)) {
    uniqueMap.set(lower, w.word);
   }
  });
  return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
 }

 get isGuessValid(): boolean {
  const guess = this.detectiveGuess.trim().toLowerCase();
  if (!guess) return false;
  return this.uniqueWords.some(w => w.toLowerCase() === guess);
 }

 translate = inject(TranslateService);

 @HostListener('window:beforeunload', ['$event'])
 unloadNotification($event: any): void {
  // Check if the game is still active logic could go here, but since vote is an active game state, always warn
  $event.returnValue = this.translate.instant('CONFIRM.MESSAGE');
 }

 ngOnInit() {
  if (this.isOnline()) {
    return; // Online mode uses server-authoritative timer
  }

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

  if (this.isOnline()) {
    const code = this.roomState()?.code;
    if (code) {
      if (this.selectedPlayerId.toString() === this.myPlayerId()?.toString()) {
        return;
      }
      this.socketService.castVote(code, this.selectedPlayerId.toString());
      this.selectedPlayerId = null; // Clear selection
    }
    return;
  }

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

  if (this.isOnline()) {
    const code = this.roomState()?.code;
    if (code) {
      this.socketService.submitGuess(code, det.id.toString(), this.detectiveGuess.trim());
      this.closeDetectiveModal();
    }
    return;
  }

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
