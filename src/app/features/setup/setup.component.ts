import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api/api.service';
import { GameEngineService } from '../../core/services/game-engine/game-engine';
import { AuthService } from '../../core/services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

// Subcomponents
import { SetupModes } from './setup-modes/setup-modes';
import { SetupTypes } from './setup-types/setup-types';
import { SetupPlayers } from './setup-players/setup-players';
import { SetupPackages } from './setup-packages/setup-packages';

export interface GameModeConfig {
  id: string;
  name: string;
}

export interface PlayerConfig {
  id: string;
  name: string;
  photoUrl?: string;
}

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [TranslateModule, CommonModule, FormsModule, SetupModes, SetupTypes, SetupPlayers, SetupPackages],
  template: `
    <div class="min-h-screen bg-transparent text-slate-50 flex flex-col">
      
      <!-- Main Routing View Switcher -->
      @switch (activeScreen()) {
        
        <!-- ================= MAIN SETUP MENU ================= -->
        @case ('main') {
          <!-- Header -->
          <header class="flex items-center justify-between py-6 px-4 mb-2">
            <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center rounded-full bg-glass border border-glass-border backdrop-blur-md text-slate-300 hover:text-white shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgba(242,13,185,0.4)] flex-1 text-center">EL IMPOSTOR</h2>
            
            <div class="flex items-center justify-end shrink-0 w-10">
              @if (authService.userSignal()) {
                <img [src]="authService.userSignal()?.photoURL || '/images/default-avatar.png'" class="w-8 h-8 rounded-full border-2 border-secondary shadow-[0_0_10px_rgba(13,242,242,0.4)] cursor-pointer" (click)="authService.logout()" title="Cerrar sesión" />
              } @else {
                <button (click)="authService.loginWithGoogle()" class="text-[0.65rem] font-bold text-secondary uppercase bg-white/5 border border-secondary/30 px-2 py-1 rounded-lg hover:bg-secondary/20 transition-colors">
                  Login
                </button>
              }
            </div>
          </header>
          <main class="flex-1 px-4 overflow-y-auto pb-40 relative custom-scrollbar">

            <!-- INFO MODAL -->
            @if (infoModalKey()) {
              <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm" (click)="infoModalKey.set(null)">
                  <div class="bg-glass backdrop-blur-2xl border border-secondary rounded-3xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(13,242,242,0.2)] flex flex-col items-center text-center animate-in fade-in zoom-in duration-300" (click)="$event.stopPropagation()">
                      <div class="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4 border border-secondary/50">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-10 h-10 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
                      </div>
                      <h3 class="text-xl font-bold text-white mb-2">{{ 'SETUP.INFO_' + infoModalKey() + '_TITLE' | translate }}</h3>
                      <div class="text-slate-300 text-sm mb-8 text-left w-full max-h-60 overflow-y-auto custom-scrollbar pr-2" [innerHTML]="'SETUP.INFO_' + infoModalKey() + '_DESC' | translate"></div>
                      <button (click)="infoModalKey.set(null)" class="w-full py-4 bg-white/10 hover:bg-white/20 border border-glass-border text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 uppercase tracking-widest cursor-pointer">
                          {{ 'SETUP.CLOSE' | translate }}
                      </button>
                  </div>
              </div>
            }

            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">{{ 'SETUP.TITLE_MAIN' | translate }}</p>
            
            <div class="bg-glass backdrop-blur-md rounded-2xl border border-glass-border divide-y divide-glass-border shadow-xl">
              
              <!-- MODO DE JUEGO -->
              <div 
                (click)="activeScreen.set('modes')"
                class="flex items-center justify-between p-5 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer first:rounded-t-2xl">
                <div class="flex items-center gap-3">
                  <img src="/images/setup/mode.png" alt="" class="w-12 h-12 shrink-0 object-contain scale-[1.15] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  <span class="font-semibold text-slate-200 flex items-center gap-2">
                    {{ 'SETUP.GAME_MODE' | translate }}
                    <button (click)="infoModalKey.set('MODE'); $event.stopPropagation()" class="w-[30px] h-[30px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
                    </button>
                  </span>
                </div>
                <div class="flex items-center gap-2 text-slate-400">
                  <span class="text-sm font-medium">{{ gameMode().name | translate }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </div>
              </div>

              <!-- TIPO DE JUEGO -->
              <div 
                (click)="activeScreen.set('types')"
                class="flex items-center justify-between p-5 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer border-b border-glass-border">
                <div class="flex items-center gap-3">
                  <img src="/images/setup/type.png" alt="" class="w-12 h-12 shrink-0 rounded-xl object-cover drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  <span class="font-semibold text-slate-200 flex items-center gap-2">
                    {{ 'SETUP.GAME_TYPE' | translate }}
                    <button (click)="infoModalKey.set('TYPE'); $event.stopPropagation()" class="w-[30px] h-[30px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
                    </button>
                  </span>
                </div>
                <div class="flex items-center gap-2 text-slate-400">
                  <span class="text-sm font-medium">{{ gameType().name | translate }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </div>
              </div>

              <!-- JUGADORES -->
              <div 
                (click)="activeScreen.set('players')"
                class="flex items-center justify-between p-5 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
                <div class="flex items-center gap-3">
                  <img src="/images/setup/players.png" alt="" class="w-12 h-12 shrink-0 object-contain scale-[1.15] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  <span class="font-semibold text-slate-200 flex items-center gap-2">
                    {{ 'SETUP.PLAYERS' | translate }}
                    <button (click)="infoModalKey.set('PLAYERS'); $event.stopPropagation()" class="w-[30px] h-[30px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
                    </button>
                  </span>
                </div>
                <div class="flex items-center gap-2 text-slate-400">
                  <span class="text-sm font-medium">{{ players().length }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </div>
              </div>

              <!-- IMPOSTORES -->
              @if (gameMode().id !== 'chaos' && gameMode().id !== 'fast') {
                  <div class="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                    <div class="flex items-center gap-3">
                      <img src="/images/setup/impostors.png" alt="" class="w-12 h-12 shrink-0 object-contain scale-[1.3] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                      <span class="font-semibold text-slate-200 flex items-center gap-2">
                        {{ 'SETUP.IMPOSTORS' | translate }}
                        <button (click)="infoModalKey.set('IMPOSTORS'); $event.stopPropagation()" class="w-[30px] h-[30px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
                        </button>
                      </span>
                    </div>
                    <div class="flex items-center gap-4 text-white">
                      <button (click)="changeImpostors(-1)" class="w-8 h-8 rounded-full border border-glass-border bg-white/10 text-secondary flex items-center justify-center text-[1.5rem] pb-[0.05rem] font-medium cursor-pointer hover:bg-white/20 transition-colors">&minus;</button>
                      <span class="text-lg font-bold w-4 text-center">{{ impostors() }}</span>
                      <button (click)="changeImpostors(1)" class="w-8 h-8 rounded-full border border-glass-border bg-white/10 text-secondary flex items-center justify-center text-2xl font-medium cursor-pointer hover:bg-white/20 transition-colors">+</button>
                    </div>
                  </div>
              }

              <!-- DETECTIVES (Condicional) -->
              @if (gameMode().id === 'detective') {
                <div class="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                    <div class="flex items-center gap-3">
                    <img src="/images/setup/detectives.png" alt="" class="w-12 h-12 shrink-0 object-contain scale-[1.15] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                    <span class="font-semibold text-slate-200 flex items-center gap-2">
                        {{ 'SETUP.DETECTIVES' | translate }}
                        <button (click)="infoModalKey.set('DETECTIVES'); $event.stopPropagation()" class="w-[30px] h-[30px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
                        </button>
                    </span>
                    </div>
                    <div class="flex items-center gap-4 text-white">
                    <button (click)="changeDetectives(-1)" class="w-8 h-8 rounded-full border border-glass-border bg-white/10 text-secondary flex items-center justify-center text-[1.5rem] pb-[0.05rem] font-medium cursor-pointer hover:bg-white/20 transition-colors">&minus;</button>
                    <span class="text-lg font-bold w-4 text-center">{{ detectives() }}</span>
                    <button (click)="changeDetectives(1)" class="w-8 h-8 rounded-full border border-glass-border bg-white/10 text-secondary flex items-center justify-center text-2xl font-medium cursor-pointer hover:bg-white/20 transition-colors">+</button>
                    </div>
                </div>
              }

              <!-- PISTAS -->
              @if (gameMode().id !== 'team' && gameMode().id !== 'infiltrator') {
                  <div class="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                    <div class="flex items-center gap-3">
                      <img src="/images/setup/hints.png" alt="" class="w-12 h-12 object-contain scale-[1.25] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                      <span class="font-semibold text-slate-200 flex flex-col justify-center">
                          <span class="flex items-center gap-2">
                             {{ 'SETUP.HINTS' | translate }}
                             <button (click)="infoModalKey.set('HINTS'); $event.stopPropagation()" class="w-[30px] h-[30px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
                             </button>
                          </span>
                      </span>
                    </div>
                    <!-- Custom Select Dropdown -->
                <div class="relative w-[133px] shrink-0">
                  <div 
                    (click)="isHintsOpen.set(!isHintsOpen())"
                    class="bg-white/10 rounded-2xl border border-primary shadow-[0_0_15px_rgba(242,13,185,0.2)] px-3 py-3 flex items-center justify-between hover:bg-white/20 transition-all cursor-pointer">
                    <span class="text-xs sm:text-sm font-medium text-slate-100 select-none">
                      @if(hints() === 'none') { {{ 'SETUP.HINT_NONE' | translate }} }
                      @else if(hints() === 'all') { {{ 'SETUP.HINT_ALL' | translate }} }
                      @else if(hints() === 'first') { {{ 'SETUP.HINT_FIRST' | translate }} }
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform" [class.rotate-180]="isHintsOpen()">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  
                  @if (isHintsOpen()) {
                    <div class="fixed inset-0 z-40" (click)="isHintsOpen.set(false)"></div>
                    <div class="absolute right-0 top-full mt-1 w-full z-50 bg-slate-900 rounded-2xl border border-primary shadow-[0_0_20px_rgba(242,13,185,0.3)] p-2 flex flex-col gap-1">
                      <div (click)="hints.set('none'); isHintsOpen.set(false)" class="px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-slate-100 text-sm font-medium cursor-pointer">
                        {{ 'SETUP.HINT_NONE' | translate }}
                      </div>
                      <div (click)="hints.set('all'); isHintsOpen.set(false)" class="px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-slate-100 text-sm font-medium cursor-pointer">
                        {{ 'SETUP.HINT_ALL' | translate }}
                      </div>
                      <div (click)="hints.set('first'); isHintsOpen.set(false)" class="px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-slate-100 text-sm font-medium cursor-pointer">
                        {{ 'SETUP.HINT_FIRST' | translate }}
                      </div>
                    </div>
                  }
                </div>
              </div>
              }

              <!-- PAQUETES -->
              <div 
                (click)="activeScreen.set('packages')"
                class="flex items-center justify-between p-5 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
                <div class="flex items-center gap-3">
                  <img src="/images/setup/package.png" alt="" class="w-12 h-12 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  <span class="font-semibold text-slate-200 flex items-center gap-2">
                    {{ 'SETUP.PACKAGES' | translate }}
                    <button (click)="infoModalKey.set('PACKAGES'); $event.stopPropagation()" class="w-[30px] h-[30px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
                    </button>
                  </span>
                </div>
                <div class="flex items-center gap-2 text-slate-400">
                  <span class="text-sm font-medium">
                     @if (selectedPackages().length === 0) {
                        {{ 'SETUP_PACKAGES.NONE_SELECTED' | translate }}
                     } @else if (selectedPackages().length === 1) {
                        {{ 'SETUP_PACKAGES.ONE_SELECTED' | translate }}
                     } @else {
                        {{ 'SETUP_PACKAGES.N_SELECTED' | translate: { count: selectedPackages().length } }}
                     }
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </div>
              </div>

              <!-- DURACION -->
              <div class="flex items-center justify-between p-5 hover:bg-white/5 transition-colors" [class.last:rounded-b-2xl]="gameType().id !== 'draw'" [class.border-b]="gameType().id === 'draw'" [class.border-glass-border]="gameType().id === 'draw'">
                <div class="flex items-center gap-3">
                  <img src="/images/setup/duration.png" alt="" class="w-12 h-12 object-contain scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  <span class="font-semibold text-slate-200 flex items-center gap-2">
                    {{ 'SETUP.DURATION' | translate }}
                    <button (click)="infoModalKey.set('DURATION'); $event.stopPropagation()" class="w-[30px] h-[30px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
                    </button>
                  </span>
                </div>
                <!-- Custom Select Dropdown -->
                <div class="relative w-[133px] shrink-0">
                  <div 
                    (click)="isDurationOpen.set(!isDurationOpen())"
                    class="bg-white/10 rounded-2xl border border-secondary shadow-[0_0_15px_rgba(13,242,242,0.2)] px-3 py-3 flex items-center justify-between hover:bg-white/20 transition-all cursor-pointer">
                    <span class="text-xs sm:text-sm font-medium text-slate-100 select-none">
                      @if(duration() === '0') { {{ 'SETUP.TIME_NONE' | translate }} }
                      @else if(duration() === '1') { 1 {{ 'SETUP.TIME_MIN' | translate }} }
                      @else { {{ duration() }} {{ 'SETUP.TIME_MINS' | translate }} }
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform" [class.rotate-180]="isDurationOpen()">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  
                  @if (isDurationOpen()) {
                    <div class="fixed inset-0 z-40" (click)="isDurationOpen.set(false)"></div>
                    <div class="absolute right-0 bottom-full mb-1 w-full z-50 bg-slate-900 rounded-2xl border border-secondary shadow-[0_0_20px_rgba(13,242,242,0.3)] p-2 flex flex-col gap-1 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
                      @for (time of ['0','1','3','5','8','10','12','15','20']; track time) {
                        <div (click)="duration.set(time); isDurationOpen.set(false)" class="px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-slate-100 text-sm font-medium cursor-pointer">
                          @if(time === '0') { {{ 'SETUP.TIME_NONE' | translate }} }
                          @else if(time === '1') { 1 {{ 'SETUP.TIME_MIN' | translate }} }
                          @else { {{ time }} {{ 'SETUP.TIME_MINS' | translate }} }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- TIEMPO DE DIBUJO -->
              @if(gameType().id === 'draw') {
              <div class="flex items-center justify-between p-5 hover:bg-white/5 transition-colors last:rounded-b-2xl">
                <div class="flex items-center gap-3">
                  <img src="/images/setup/turn_time.png" alt="" class="w-12 h-12 object-contain scale-[1.65] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  <span class="font-semibold text-slate-200 flex items-center gap-2">
                    {{ 'SETUP.DRAW_TIME' | translate }}
                    <button (click)="infoModalKey.set('DRAW_TIME'); $event.stopPropagation()" class="w-[30px] h-[30px] rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 hover:bg-secondary/40 transition-colors pointer-events-auto shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
                    </button>
                  </span>
                </div>
                <!-- Custom Select Dropdown -->
                <div class="relative w-[133px] shrink-0">
                  <div 
                    (click)="isDrawTimeOpen.set(!isDrawTimeOpen())"
                    class="bg-white/10 rounded-2xl border border-secondary shadow-[0_0_15px_rgba(13,242,242,0.2)] px-3 py-3 flex items-center justify-between hover:bg-white/20 transition-all cursor-pointer">
                    <span class="text-xs sm:text-sm font-medium text-slate-100 select-none">
                      {{ drawTurnTime() }} {{ 'SETUP.SECS' | translate }}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-slate-400 transition-transform" [class.rotate-180]="isDrawTimeOpen()">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  
                  @if (isDrawTimeOpen()) {
                    <div class="fixed inset-0 z-40" (click)="isDrawTimeOpen.set(false)"></div>
                    <div class="absolute right-0 bottom-full mb-1 w-full z-50 bg-slate-900 rounded-2xl border border-secondary shadow-[0_0_20px_rgba(13,242,242,0.3)] p-2 flex flex-col gap-1 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
                      @for (time of [1,2,3,4,5,6,7,8,9,10]; track time) {
                        <div (click)="drawTurnTime.set(time); isDrawTimeOpen.set(false)" class="px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-slate-100 text-sm font-medium cursor-pointer">
                          {{ time }} {{ 'SETUP.SECS' | translate }}
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
              }
            </div>

            @if (!canStart() || selectedPackages().length === 0) {
              <div class="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 shrink-0 mt-0.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p class="text-sm leading-relaxed">{{ 'SETUP.WARNING_CANNOT_START' | translate }}</p>
              </div>
            }

          </main>
          
          <!-- PLAY FOOTER -->
          <footer class="fixed bottom-0 left-0 right-0 p-6 pt-12">
            <!-- Fade for floating effect without solid bg -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent -z-10 w-full h-full pointer-events-none"></div>

            <button 
                (click)="startGame()"
                [disabled]="!canStart() || apiService.isLoading()"
                class="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold py-4 text-xl shadow-[0_0_30px_rgba(242,13,185,0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                <div class="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
                <span class="relative z-10 drop-shadow-md tracking-wider">{{ 'SETUP.START_GAME' | translate }}</span>
            </button>
          </footer>
        }

        <!-- ================= MODES VIEW ================= -->
        @case ('modes') {
            <app-setup-modes 
                [currentMode]="gameMode()" 
                (onBack)="activeScreen.set('main')"
                (onChange)="onGameModeChanged($event)">
            </app-setup-modes>
        }

        <!-- ================= TYPES VIEW ================= -->
        @case ('types') {
            <app-setup-types 
                [currentType]="gameType()" 
                (onBack)="activeScreen.set('main')"
                (onChange)="gameType.set($event)">
            </app-setup-types>
        }

        <!-- ================= PLAYERS VIEW ================= -->
        @case ('players') {
            <app-setup-players 
              [currentPlayers]="players()"
              [presetId]="selectedPresetId()"
              (presetIdChange)="selectedPresetId.set($event)"
              (onChange)="updatePlayers($event)"
              (onBack)="activeScreen.set('main')">
            </app-setup-players>
        }

        <!-- ================= PACKAGES VIEW ================= -->
        @case ('packages') {
            <app-setup-packages 
                [apiPackages]="apiService.packages()"
                [selectedIds]="selectedPackages()" 
                (onBack)="activeScreen.set('main')"
                (onChange)="selectedPackages.set($event)">
            </app-setup-packages>
        }

      }

      <!-- MODAL ALERTAS GENERICO -->
      @if (alertModal().show) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-glass-border rounded-3xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            
            <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2" [ngClass]="alertModal().isError ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'">
              @if (alertModal().isError) {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              }
            </div>
            
            <h3 class="text-2xl font-black text-white">
              {{ alertModal().title }}
            </h3>
            
            <p class="text-base text-slate-400 mb-2">
              {{ alertModal().message }}
            </p>
            
            <button 
              (click)="alertModal.set({show: false, title: '', message: '', isError: false})"
              class="w-full py-4 rounded-2xl font-bold transition-all active:scale-95"
              [ngClass]="alertModal().isError ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_rgba(242,13,185,0.3)]'">
              {{ 'COMMON.OK' | translate }}
            </button>
            
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

    /* Custom Scrollbar for Dropdowns */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background-color: #0f172a;
      border-radius: 8px;
      margin: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(13, 242, 242, 0.3);
      border-radius: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(13, 242, 242, 0.6);
    }
  `]
})
export class SetupComponent implements OnInit {
  private router = inject(Router);
  apiService = inject(ApiService);
  private gameEngine = inject(GameEngineService);
  authService = inject(AuthService);
  translate = inject(TranslateService);

  // States
  activeScreen = signal<'main' | 'modes' | 'types' | 'players' | 'packages'>('main');

  gameMode = signal<GameModeConfig>({ id: 'classic', name: 'RULES.CLASSIC' });
  gameType = signal<{ id: string, name: string }>({ id: 'word', name: 'RULES.TYPE_WORD' });

  players = signal<PlayerConfig[]>([
    { id: '1', name: 'Jugador 1' },
    { id: '2', name: 'Jugador 2' },
    { id: '3', name: 'Jugador 3' },
  ]);

  impostors = signal<number>(1);
  detectives = signal<number>(0);
  hints = signal<string>('none'); // none, all, first
  duration = signal<string>('5'); // en minutos, '0' = Sin tiempo
  drawTurnTime = signal<number>(10); // en segundos

  selectedPackages = signal<string[]>(['mock-3', 'mock-5']);
  selectedPresetId = signal<string | null>(null);

  // Custom Select States
  isHintsOpen = signal<boolean>(false);
  isDurationOpen = signal<boolean>(false);
  isDrawTimeOpen = signal<boolean>(false);

  infoModalKey = signal<string | null>(null);

  // Alert Modal
  alertModal = signal<{ show: boolean, title: string, message: string, isError: boolean }>({
    show: false, title: '', message: '', isError: false
  });

  showAlert(titleKey: string, messageKey: string, isError: boolean = false, params?: any) {
    const title = this.translate.instant(titleKey);
    const message = this.translate.instant(messageKey, params);
    this.alertModal.set({ show: true, title, message, isError });
  }

  // Computeds
  packagesSelectedText = computed(() => {
    const len = this.selectedPackages().length;
    // Simplified since Angular components prefer pure pipes, we just emit a key. Actually we could import TranslateService.
    // For simplicity, let's keep English fallback or we can use the pipe in the template since it is a getter. Wait, if it's computed here we should use translation service or let template do the work.
    // Let's modify the template to handle this! But I just edited template without touching this logic. Let's fix template below too to use the pipe.
    return len.toString();
  });

  canStart = computed(() => {
    const isDetectiveMode = this.gameMode().id === 'detective';
    const isTeamMode = this.gameMode().id === 'team';
    const minImpostors = isDetectiveMode ? 0 : (isTeamMode ? 2 : 1);
    const minDetectives = isDetectiveMode ? 1 : 0;

    return this.players().length >= 3 &&
      this.selectedPackages().length > 0 &&
      this.impostors() >= minImpostors &&
      this.detectives() >= minDetectives &&
      (this.impostors() + this.detectives()) < this.players().length;
  });

  constructor() {
    effect(() => {
      this.saveState();
    });
  }

  ngOnInit() {
    this.apiService.fetchPackages();
    this.restoreState();
  }

  // State Persistence
  private saveState() {
    try {
      const state = {
        gameMode: this.gameMode(),
        gameType: this.gameType(),
        players: this.players(),
        impostors: this.impostors(),
        detectives: this.detectives(),
        hints: this.hints(),
        duration: this.duration(),
        drawTurnTime: this.drawTurnTime(),
        selectedPackages: this.selectedPackages(),
        selectedPresetId: this.selectedPresetId()
      };
      localStorage.setItem('impostorSetupState', JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save setup state', e);
    }
  }

  private restoreState() {
    try {
      const saved = localStorage.getItem('impostorSetupState');
      if (saved) {
        const state = JSON.parse(saved);
        if (state.gameMode) this.gameMode.set(state.gameMode);
        if (state.gameType) this.gameType.set(state.gameType);
        if (state.players) this.players.set(state.players);
        if (state.impostors !== undefined) this.impostors.set(state.impostors);
        if (state.detectives !== undefined) this.detectives.set(state.detectives);
        if (state.hints) {
          let h = state.hints;
          if (h === 'Ninguna') h = 'none';
          if (h === 'Todos') h = 'all';
          if (h === 'Solo uno') h = 'first';
          this.hints.set(h);
        }
        if (state.duration) this.duration.set(state.duration);
        if (state.drawTurnTime !== undefined) this.drawTurnTime.set(state.drawTurnTime);
        if (state.selectedPackages) this.selectedPackages.set(state.selectedPackages);
        if (state.selectedPresetId !== undefined) this.selectedPresetId.set(state.selectedPresetId);
      }
    } catch (e) {
      console.warn('Could not restore setup state', e);
    }
  }

  // Mode Validation
  onGameModeChanged(mode: GameModeConfig) {
    this.gameMode.set(mode);

    // Apply constraints based on new mode
    if (mode.id === 'fast') {
      this.impostors.set(1);
    } else if (mode.id === 'team') {
      this.impostors.set(Math.max(2, this.impostors()));
      this.hints.set('none');
    } else if (mode.id === 'infiltrator') {
      this.hints.set('none');
    } else if (mode.id === 'detective') {
      if (this.detectives() < 1) {
        this.detectives.set(1);
      }
    }

    // Reset detectives if not detective mode to prevent bugs
    if (mode.id !== 'detective') {
      this.detectives.set(0);
    }
  }

  // Mutators for specific limits
  changeImpostors(delta: number) {
    const min = this.gameMode().id === 'detective' ? 0 : (this.gameMode().id === 'team' ? 2 : 1);
    this.impostors.update(v => Math.max(min, Math.min(this.players().length - this.detectives() - 1, v + delta)));
  }

  changeDetectives(delta: number) {
    const min = this.gameMode().id === 'detective' ? 1 : 0;
    this.detectives.update(v => Math.max(min, Math.min(this.players().length - this.impostors() - 1, v + delta)));
  }

  updatePlayers(newPlayers: PlayerConfig[]) {
    this.players.set(newPlayers);
    // Cap impostors if we removed players
    if (this.impostors() + this.detectives() >= newPlayers.length) {
      const min = this.gameMode().id === 'detective' ? 0 : (this.gameMode().id === 'team' ? 2 : 1);
      this.impostors.set(Math.max(min, newPlayers.length - this.detectives() - 1));
    }
  }

  async startGame() {
    if (!this.canStart() || this.selectedPackages().length === 0) return;

    this.saveState();

    try {
      const packageIds = this.selectedPackages();

      // Fetch all packages in parallel for maximum speed
      const wordPromises = packageIds.map(id => this.apiService.getWordsByPackage(id));
      const wordsArrays = await Promise.all(wordPromises);

      const allWords = wordsArrays.flat();

      if (allWords.length === 0) {
        this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.NO_WORDS', true);
        return;
      }

      // We pass the settings to the engine logic
      const playerData = this.players().map(p => ({
        name: p.name,
        photoUrl: p.photoUrl
      }));

      this.gameEngine.startGame({
        playerData,
        words: allWords,
        numImpostors: this.impostors(),
        numDetectives: this.detectives(),
        modeId: this.gameMode().id,
        gameTypeId: this.gameType().id as 'word' | 'question' | 'draw',
        duration: this.duration(),
        hints: this.hints(),
        drawTurnTime: this.drawTurnTime()
      });

      // Go to play screen
      this.router.navigate(['/play']);
    } catch (e) {
      console.error('Failed to start game', e);
      this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.START_ERROR', true);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
