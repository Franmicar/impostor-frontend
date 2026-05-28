import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api/api.service';
import { GameEngineService } from '../../core/services/game-engine/game-engine';
import { AuthService } from '../../core/services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BillingService } from '../../core/services/billing.service';
import { ThemeService } from '../../core/services/theme.service';
import { UiService } from '../../core/services/ui/ui.service';
import { Preferences } from '@capacitor/preferences';
import { SocketService } from '../../core/services/socket/socket.service';

// Subcomponents
import { SetupModes } from './setup-modes/setup-modes';
import { SetupTypes } from './setup-types/setup-types';
import { SetupPlayers } from './setup-players/setup-players';
import { SetupPackages } from './setup-packages/setup-packages';

import { ButtonPrimaryComponent } from '../../shared/components/ui/button-primary.component';
import { ButtonSecondaryComponent } from '../../shared/components/ui/button-secondary.component';
import { IconButtonComponent } from '../../shared/components/ui/icon-button.component';
import { IconButtonMiniComponent } from '../../shared/components/ui/icon-button-mini.component';
import { SelectComponent } from '../../shared/components/ui/select.component';
import { ModalComponent } from '../../shared/components/ui/modal.component';
import { HeaderComponent } from '../../shared/components/ui/header.component';
import { FooterComponent } from '../../shared/components/ui/footer.component';
import { AuthProfileComponent } from '../../shared/components/ui/auth-profile.component';

export interface GameModeConfig {
  id: string;
  name: string;
}

export interface PlayerConfig {
  id: string;
  name: string;
  photoUrl?: string;
  avatarColor?: string;
  avatarFrame?: string;
}

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [
    TranslateModule, CommonModule, FormsModule, SetupModes, SetupTypes, SetupPlayers, SetupPackages,
    ButtonPrimaryComponent, ButtonSecondaryComponent, IconButtonComponent, IconButtonMiniComponent,
    SelectComponent, ModalComponent, HeaderComponent, FooterComponent, AuthProfileComponent
  ],
  template: `
  <div class="min-h-dvh bg-transparent text-textPrimary flex flex-col">
   
   <!-- Main Routing View Switcher -->
   @switch (activeScreen()) {
    
    <!-- ================= MAIN SETUP MENU ================= -->
    @case ('main') {
     <!-- Header -->
     <app-header [showBack]="true" [title]="'Deceptra'" (onBack)="goBack()">
      <div header-extra>
        <app-auth-profile avatarSize="w-10 h-10" [showLoginButton]="true"></app-auth-profile>
      </div>
     </app-header>
     <main class="flex-1 px-4 relative custom-scrollbar pt-2 sm:pt-4">

      <!-- INFO MODAL -->
      <app-modal
        [isOpen]="!!infoModalKey()"
        [title]="infoModalKey() ? ('SETUP.INFO_' + infoModalKey() + '_TITLE' | translate) : ''"
        (onClose)="infoModalKey.set(null)">
        
        <div modal-icon class="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4 border border-secondary/50">
          <span class="font-serif italic font-black text-4xl leading-none text-secondary">i</span>
        </div>

        @if (infoModalKey()) {
          <div class="text-textMuted text-sm text-left w-full" [innerHTML]="'SETUP.INFO_' + infoModalKey() + '_DESC' | translate"></div>
        }
        
        <app-button-secondary modal-footer (onClick)="infoModalKey.set(null)">
          <span class="uppercase tracking-widest font-bold">{{ 'SETUP.CLOSE' | translate }}</span>
        </app-button-secondary>
      </app-modal>

      <!-- PREMIUM UPSELL -->
      @if (!billing.isPremium) {
       <div (click)="openPremium()" class="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl p-4 mb-6 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors shadow-[0_0_20px_rgb(var(--color-primary)/0.4)]">
        <div class="flex items-center gap-3">
         <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_10px_rgb(var(--color-primary)/0.4)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white">
           <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
         </div>
         <div>
          <h3 class="text-white font-bold tracking-wide">{{ 'SETUP.PREMIUM_BANNER_TITLE' | translate }}</h3>
          <p class="text-xs text-textMuted">{{ 'SETUP.PREMIUM_BANNER_DESC' | translate }}</p>
         </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-secondary">
         <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
       </div>
      }

      <!-- ONLINE LOBBY / PLAYERS LIST -->
      @if (gameEngine.isOnline() && socketService.roomState()) {
        @if (!isHost()) {
          <div class="bg-glass border border-primary/30 rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-lg animate-pulse">
            <div class="relative flex h-3.5 w-3.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
            </div>
            <span class="text-sm font-semibold text-textPrimary">
              {{ 'SETUP.HOST_CONFIGURING' | translate }}
            </span>
          </div>
        }

        <!-- Room Code Card -->
        <div class="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-2xl p-4 mb-6 flex flex-col items-center justify-center relative shadow-lg">
          <span class="text-xs text-textMuted uppercase tracking-widest font-bold mb-1">{{ 'SETUP.ROOM_CODE' | translate }}</span>
          <div class="flex items-center gap-3">
            <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-widest drop-shadow-[0_0_10px_rgb(var(--color-primary)/0.4)]">
              {{ socketService.roomState().code }}
            </span>
            <app-icon-button (onClick)="copyRoomCode()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-secondary">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6" />
              </svg>
            </app-icon-button>
          </div>
        </div>

        <!-- Connected Players Grid -->
        <div class="bg-glass border border-glass-border rounded-2xl p-4 mb-6 shadow-lg">
          <div class="flex items-center justify-between mb-3 pl-1">
            <span class="text-xs font-bold text-textMuted uppercase tracking-widest">{{ 'SETUP.PLAYERS_IN_ROOM' | translate: { count: socketService.roomState().players.length } }}</span>
            <span class="text-xs text-secondary font-medium">{{ 'SETUP.MULTIPLAYER_LOBBY' | translate }}</span>
          </div>
          <div class="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            @for (player of socketService.roomState().players; track player.id) {
              <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2 pl-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-sm relative border border-primary/40 shrink-0">
                  @if (player.photoUrl) {
                    <img [src]="player.photoUrl" class="w-full h-full object-cover rounded-full" />
                  } @else {
                    {{ player.name.substring(0,2) | uppercase }}
                  }
                  @if (player.isHost) {
                    <div class="absolute -top-1 -right-1 bg-yellow-400 w-3.5 h-3.5 rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <span class="text-[8px] font-black text-slate-900">★</span>
                    </div>
                  }
                </div>
                <div class="flex flex-col truncate">
                  <span class="text-sm font-semibold text-textPrimary truncate leading-tight">{{ player.name }}{{ player.id === socketService.myPlayerId() ? ('COMMON.ME' | translate) : '' }}</span>
                  <span class="text-[10px] text-textMuted leading-none mt-0.5">
                    {{ player.isHost ? ('SETUP.HOST' | translate) : ('SETUP.PLAYER' | translate) }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <p class="text-xs font-bold text-textMuted uppercase tracking-widest mb-4 ml-2">{{ 'SETUP.TITLE_MAIN' | translate }}</p>
      
      <div class="bg-glass backdrop-blur-md rounded-2xl border border-glass-border divide-y divide-glass-border shadow-xl">
       
       <!-- MODO DE JUEGO -->
       <div 
        (click)="isHost() && activeScreen.set('modes')"
        [class.cursor-default]="!isHost()"
        [class.cursor-pointer]="isHost()"
        class="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 active:bg-white/10 transition-colors first:rounded-t-2xl">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-12 h-12 sm:w-[72px] sm:h-[72px]">
          <img [src]="themeService.resolveAsset('setup.mode')" alt="" class="w-full h-full object-cover neon-dynamic-img">
         </div>
         <span class="font-semibold text-textPrimary flex items-center gap-2">
          {{ 'SETUP.GAME_MODE' | translate }}
          <app-icon-button-mini (onClick)="infoModalKey.set('MODE'); $event.stopPropagation()">
           <span class="font-serif italic font-black text-lg leading-none">i</span>
          </app-icon-button-mini>
         </span>
        </div>
        <div class="flex items-center gap-2 text-textMuted">
         <span class="text-sm font-medium">{{ gameMode().name | translate }}</span>
         @if (isHost()) {
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
         }
        </div>
       </div>

       <!-- TIPO DE JUEGO -->
       <div 
        (click)="isHost() && activeScreen.set('types')"
        [class.cursor-default]="!isHost()"
        [class.cursor-pointer]="isHost()"
        class="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 active:bg-white/10 transition-colors border-b border-glass-border">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-12 h-12 sm:w-[72px] sm:h-[72px]">
          <img [src]="themeService.resolveAsset('setup.type')" alt="" class="w-full h-full object-cover neon-dynamic-img">
         </div>
         <span class="font-semibold text-textPrimary flex items-center gap-2">
          {{ 'SETUP.GAME_TYPE' | translate }}
          <app-icon-button-mini (onClick)="infoModalKey.set('TYPE'); $event.stopPropagation()">
           <span class="font-serif italic font-black text-lg leading-none">i</span>
          </app-icon-button-mini>
         </span>
        </div>
        <div class="flex items-center gap-2 text-textMuted">
         <span class="text-sm font-medium">{{ gameType().name | translate }}</span>
         @if (isHost()) {
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
         }
        </div>
       </div>

       <!-- JUGADORES -->
       <div 
        (click)="!gameEngine.isOnline() && activeScreen.set('players')"
        [class.cursor-default]="gameEngine.isOnline()"
        [class.cursor-pointer]="!gameEngine.isOnline()"
        class="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 active:bg-white/10 transition-colors">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-12 h-12 sm:w-[72px] sm:h-[72px]">
          <img [src]="themeService.resolveAsset('setup.players')" alt="" class="w-full h-full object-cover neon-dynamic-img">
         </div>
         <span class="font-semibold text-textPrimary flex items-center gap-2">
          {{ 'SETUP.PLAYERS' | translate }}
          <app-icon-button-mini (onClick)="infoModalKey.set('PLAYERS'); $event.stopPropagation()">
           <span class="font-serif italic font-black text-lg leading-none">i</span>
          </app-icon-button-mini>
         </span>
        </div>
        <div class="flex items-center gap-2 text-textMuted">
         <span class="text-sm font-medium">
           {{ gameEngine.isOnline() ? (socketService.roomState()?.players?.length || 0) : (selectedPresetName() ? selectedPresetName() + ' (' + players().length + ')' : players().length) }}
         </span>
         @if (!gameEngine.isOnline()) {
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
         }
        </div>
       </div>

       <!-- IMPOSTORES -->
       @if (gameMode().id !== 'chaos' && gameMode().id !== 'fast') {
         <div class="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3">
           <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-12 h-12 sm:w-[72px] sm:h-[72px]">
            <img [src]="themeService.resolveAsset('setup.impostors')" alt="" class="w-full h-full object-cover neon-dynamic-img">
           </div>
           <span class="font-semibold text-textPrimary flex items-center gap-2">
            {{ 'SETUP.IMPOSTORS' | translate }}
            <app-icon-button-mini (onClick)="infoModalKey.set('IMPOSTORS'); $event.stopPropagation()">
             <span class="font-serif italic font-black text-lg leading-none">i</span>
            </app-icon-button-mini>
           </span>
          </div>
          <div class="flex items-center gap-2 text-textPrimary">
           @if (isHost()) {
             <app-icon-button-mini (onClick)="changeImpostors(-1)"><span class="text-[1.5rem] pb-[0.05rem] font-medium">&minus;</span></app-icon-button-mini>
           }
           <span class="text-lg font-bold w-4 text-center">{{ impostors() }}</span>
           @if (isHost()) {
             <app-icon-button-mini (onClick)="changeImpostors(1)"><span class="text-[1.5rem] pb-[0.05rem] font-medium">+</span></app-icon-button-mini>
           }
          </div>
         </div>
       }

       <!-- DETECTIVES (Condicional) -->
       @if (gameMode().id === 'detective') {
        <div class="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3">
           <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-12 h-12 sm:w-[72px] sm:h-[72px]">
            <img [src]="themeService.resolveAsset('setup.detectives')" alt="" class="w-full h-full object-cover neon-dynamic-img">
           </div>
           <span class="font-semibold text-textPrimary flex items-center gap-2">
             {{ 'SETUP.DETECTIVES' | translate }}
             <app-icon-button-mini (onClick)="infoModalKey.set('DETECTIVES'); $event.stopPropagation()">
              <span class="font-serif italic font-black text-lg leading-none">i</span>
             </app-icon-button-mini>
           </span>
          </div>
          <div class="flex items-center gap-2 text-textPrimary">
          @if (isHost()) {
            <app-icon-button-mini (onClick)="changeDetectives(-1)"><span class="text-[1.5rem] pb-[0.05rem] font-medium">&minus;</span></app-icon-button-mini>
          }
          <span class="text-lg font-bold w-4 text-center">{{ detectives() }}</span>
          @if (isHost()) {
            <app-icon-button-mini (onClick)="changeDetectives(1)"><span class="text-[1.5rem] pb-[0.05rem] font-medium">+</span></app-icon-button-mini>
          }
          </div>
        </div>
       }

       <!-- PISTAS -->
       @if (gameMode().id !== 'team' && gameMode().id !== 'infiltrator') {
         <div class="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3">
           <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-12 h-12 sm:w-[72px] sm:h-[72px]">
            <img [src]="themeService.resolveAsset('setup.hints')" alt="" class="w-full h-full object-cover neon-dynamic-img">
           </div>
           <span class="font-semibold text-textPrimary flex flex-col justify-center">
             <span class="flex items-center gap-2">
               {{ 'SETUP.HINTS' | translate }}
               <app-icon-button-mini (onClick)="infoModalKey.set('HINTS'); $event.stopPropagation()">
                <span class="font-serif italic font-black text-lg leading-none">i</span>
               </app-icon-button-mini>
             </span>
           </span>
          </div>
          <!-- Custom Select Dropdown -->
          <app-select 
            [disabled]="!isHost()"
            [options]="hintsOptions"
            [value]="hints()"
            (valueChange)="hints.set($event)">
          </app-select>
       </div>
       }

       <!-- PAQUETES -->
       <div 
        (click)="isHost() && activeScreen.set('packages')"
        [class.cursor-default]="!isHost()"
        [class.cursor-pointer]="isHost()"
        class="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-12 h-12 sm:w-[72px] sm:h-[72px]">
          <img [src]="themeService.resolveAsset('setup.package')" alt="" class="w-full h-full object-cover neon-dynamic-img">
         </div>
         <span class="font-semibold text-textPrimary flex items-center gap-2">
          {{ 'SETUP.PACKAGES' | translate }}
          <app-icon-button-mini (onClick)="infoModalKey.set('PACKAGES'); $event.stopPropagation()">
           <span class="font-serif italic font-black text-lg leading-none">i</span>
          </app-icon-button-mini>
         </span>
        </div>
        <div class="flex items-center gap-2 text-textMuted">
         <span class="text-sm font-medium">
           @if (selectedPackages().length === 0) {
            {{ 'SETUP_PACKAGES.NONE_SELECTED' | translate }}
           } @else if (selectedPackages().length === 1) {
            {{ 'SETUP_PACKAGES.ONE_SELECTED' | translate }}
           } @else {
            {{ 'SETUP_PACKAGES.N_SELECTED' | translate: { count: selectedPackages().length } }}
           }
         </span>
         @if (isHost()) {
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
         }
        </div>
       </div>

       <!-- DURACION -->
       <div class="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors" [class.last:rounded-b-2xl]="gameType().id !== 'draw'" [class.border-b]="gameType().id === 'draw'" [class.border-glass-border]="gameType().id === 'draw'">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-12 h-12 sm:w-[72px] sm:h-[72px]">
          <img [src]="themeService.resolveAsset('setup.duration')" alt="" class="w-full h-full object-cover neon-dynamic-img">
         </div>
         <span class="font-semibold text-textPrimary flex items-center gap-2">
          {{ 'SETUP.DURATION' | translate }}
          <app-icon-button-mini (onClick)="infoModalKey.set('DURATION'); $event.stopPropagation()">
           <span class="font-serif italic font-black text-lg leading-none">i</span>
          </app-icon-button-mini>
         </span>
        </div>
        <!-- Custom Select Dropdown -->
          <app-select 
            [disabled]="!isHost()"
            [options]="durationOptions"
            [value]="duration()"
            (valueChange)="duration.set($event)">
          </app-select>
       </div>

       <!-- TIEMPO DE DIBUJO -->
       @if(gameType().id === 'draw') {
       <div class="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors last:rounded-b-2xl">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-12 h-12 sm:w-[72px] sm:h-[72px]">
          <img [src]="themeService.resolveAsset('setup.turn_time')" alt="" class="w-full h-full object-cover neon-dynamic-img">
         </div>
         <span class="font-semibold text-textPrimary flex items-center gap-2">
          {{ 'SETUP.DRAW_TIME' | translate }}
          <app-icon-button-mini (onClick)="infoModalKey.set('DRAW_TIME'); $event.stopPropagation()">
           <span class="font-serif italic font-black text-lg leading-none">i</span>
          </app-icon-button-mini>
         </span>
        </div>
        <!-- Custom Select Dropdown -->
          <app-select 
            [disabled]="!isHost()"
            [options]="drawTimeOptions"
            [value]="drawTurnTime()"
            (valueChange)="drawTurnTime.set($event)">
          </app-select>
       </div>
       }
      </div>

      @if (isHost() && (!canStart() || selectedPackages().length === 0)) {
       <div class="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 shrink-0 mt-0.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <p class="text-sm leading-relaxed">{{ 'SETUP.WARNING_CANNOT_START' | translate }}</p>
       </div>
      }

     </main>
     
     <!-- PLAY FOOTER -->
     <app-footer>
      <app-button-primary 
        (onClick)="startGame()"
        [disabled]="(gameEngine.isOnline() && !isHost()) || !canStart() || uiService.isLoading()">
        {{ (gameEngine.isOnline() && !isHost()) ? ('COMMON.WAITING_HOST' | translate | uppercase) : ('SETUP.START_GAME' | translate) }}
      </app-button-primary>
     </app-footer>
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
       (presetNameChange)="selectedPresetName.set($event)"
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

    <!-- ================= CONNECT VIEW (ONLINE) ================= -->
    @case ('online-connect') {
      <app-header [showBack]="true" [title]="'SETUP.MULTIPLAYER' | translate" (onBack)="goBack()"></app-header>
      <main class="flex-1 px-6 flex flex-col justify-center max-w-md mx-auto w-full gap-6 pb-20 pt-10">
        
        <div class="text-center mb-4">
          <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgb(var(--color-primary)/0.4)] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10 text-white animate-pulse">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
            </svg>
          </div>
          <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-md">{{ 'SETUP.MULTIPLAYER_TITLE' | translate }}</h2>
          <p class="text-sm text-textMuted mt-1">{{ 'SETUP.MULTIPLAYER_DESC' | translate }}</p>
        </div>

        <!-- Connection Card -->
        <div class="bg-glass border border-glass-border rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
          <!-- Input Nombre -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-textMuted uppercase tracking-widest pl-1">{{ 'SETUP.YOUR_NAME' | translate }}</label>
            <input 
              type="text" 
              [value]="playerName()"
              (input)="playerName.set($any($event.target).value)" 
              [placeholder]="'SETUP.YOUR_NAME_PH' | translate" 
              class="w-full bg-slate-950/50 border border-glass-border focus:border-primary text-white rounded-2xl px-4 py-3 text-lg font-medium outline-none transition-all placeholder:text-textMuted/50 focus:shadow-[0_0_15px_rgb(var(--color-primary)/0.2)]" />
          </div>

          <!-- Input Código (Unirse) -->
          <div class="flex flex-col gap-2 mt-2">
            <label class="text-xs font-bold text-textMuted uppercase tracking-widest pl-1">{{ 'SETUP.ROOM_CODE_OPTIONAL' | translate }}</label>
            <input 
              type="text" 
              [value]="joinRoomCode()"
              (input)="joinRoomCode.set($any($event.target).value)" 
              [placeholder]="'SETUP.ROOM_CODE_PH' | translate" 
              maxlength="4"
              class="w-full bg-slate-950/50 border border-glass-border focus:border-secondary text-white rounded-2xl px-4 py-3 text-lg font-bold tracking-widest uppercase text-center outline-none transition-all placeholder:text-textMuted/50 focus:shadow-[0_0_15px_rgb(var(--color-secondary)/0.2)]" />
          </div>

          <!-- Connecting state -->
          @if (isConnecting()) {
            <div class="flex items-center justify-center gap-3 py-4 text-secondary font-bold">
              <div class="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <span>{{ 'SETUP.CONNECTING' | translate }}</span>
            </div>
          } @else {
            <div class="flex flex-col gap-3 mt-4">
              <!-- Join Button if Code entered -->
              @if (joinRoomCode().trim().length >= 4) {
                <app-button-primary (onClick)="joinOnlineRoom()">
                  {{ 'SETUP.JOIN_ROOM' | translate }}
                </app-button-primary>
              } @else {
                <app-button-primary (onClick)="createOnlineRoom()">
                  {{ 'SETUP.CREATE_ROOM' | translate }}
                </app-button-primary>
              }
            </div>
          }
        </div>
      </main>
    }

   }

   <!-- MODAL ALERTAS GENERICO -->
   <app-modal
     [isOpen]="alertModal().show"
     [title]="alertModal().title"
     [icon]="alertModal().isError ? 'error' : 'success'"
     (onClose)="alertModal.set({show: false, title: '', message: '', isError: false})">
     
     <p class="text-base text-textMuted w-full">
      {{ alertModal().message }}
     </p>
     
     <button modal-footer
      (click)="alertModal.set({show: false, title: '', message: '', isError: false})"
      class="w-full py-4 rounded-2xl font-bold transition-all active:scale-95 uppercase tracking-widest"
      [ngClass]="alertModal().isError ? 'bg-glass border border-glass-border hover:bg-glass-hover text-textPrimary' : 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_rgb(var(--color-primary)/0.4)]'">
      {{ 'COMMON.OK' | translate }}
     </button>
   </app-modal>

   <!-- TOAST COPIADO -->
   @if (showCopiedToast()) {
     <div class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-5 py-3 rounded-full border border-primary/30 shadow-[0_0_20px_rgba(var(--color-primary)/0.3)] backdrop-blur-md z-50 flex items-center gap-2 animate-bounce">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4 text-secondary">
         <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
       </svg>
       <span class="text-xs font-semibold tracking-wide">{{ 'COMMON.COPIED_CLIPBOARD' | translate }}</span>
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
  public apiService = inject(ApiService);
  public gameEngine = inject(GameEngineService);
  authService = inject(AuthService);
  private translate = inject(TranslateService);
  public billing = inject(BillingService);
  public themeService = inject(ThemeService);
  public uiService = inject(UiService);
  public socketService = inject(SocketService);

  // States
  activeScreen = signal<'main' | 'modes' | 'types' | 'players' | 'packages' | 'online-connect'>('main');
  playerName = signal<string>('');
  joinRoomCode = signal<string>('');
  isConnecting = signal<boolean>(false);
  showCopiedToast = signal<boolean>(false);

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
  selectedPresetName = signal<string | null>(null);

  // Custom Select States
  isHintsOpen = signal<boolean>(false);
  isDurationOpen = signal<boolean>(false);
  isDrawTimeOpen = signal<boolean>(false);

  infoModalKey = signal<string | null>(null);

  get hintsOptions() {
    return [
      { label: this.translate.instant('SETUP.HINT_NONE'), value: 'none' },
      { label: this.translate.instant('SETUP.HINT_ALL'), value: 'all' },
      { label: this.translate.instant('SETUP.HINT_FIRST'), value: 'first' }
    ];
  }

  get durationOptions() {
    const times = ['0', '1', '3', '5', '8', '10', '12', '15', '20'];
    return times.map(time => {
      if (time === '0') return { label: this.translate.instant('SETUP.TIME_NONE'), value: '0' };
      if (time === '1') return { label: '1 ' + this.translate.instant('SETUP.TIME_MIN'), value: '1' };
      return { label: time + ' ' + this.translate.instant('SETUP.TIME_MINS'), value: time };
    });
  }

  get drawTimeOptions() {
    const times = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return times.map(time => ({
      label: time + ' ' + this.translate.instant('SETUP.SECS'),
      value: time
    }));
  }

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
    const minPlayers = isDetectiveMode ? 4 : 3;

    const currentPlayersCount = this.gameEngine.isOnline()
      ? (this.socketService.roomState()?.players?.length || 0)
      : this.players().length;

    if (this.gameEngine.isOnline()) {
      return this.isHost() &&
        currentPlayersCount >= minPlayers &&
        this.selectedPackages().length > 0 &&
        this.impostors() >= minImpostors &&
        this.detectives() >= minDetectives &&
        (this.impostors() + this.detectives()) < currentPlayersCount;
    }

    return this.players().length >= minPlayers &&
      this.selectedPackages().length > 0 &&
      this.impostors() >= minImpostors &&
      this.detectives() >= minDetectives &&
      (this.impostors() + this.detectives()) < this.players().length;
  });

  isHost = computed(() => {
    if (!this.gameEngine.isOnline()) return true;
    const myId = this.socketService.myPlayerId();
    if (!myId) return false;
    const state = this.socketService.roomState();
    if (!state) return false;
    const me = state.players.find((p: any) => p.id === myId);
    return me ? !!me.isHost : false;
  });

  constructor() {
    effect(() => {
      this.saveState();
    });

    effect(() => {
      const state = this.socketService.roomState();
      if (this.gameEngine.isOnline() && state && this.activeScreen() === 'online-connect') {
        this.isConnecting.set(false);
        this.activeScreen.set('main');
      }
    });

    effect(() => {
      const state = this.socketService.roomState();
      if (this.gameEngine.isOnline() && state && !this.isHost()) {
        const settings = state.settings;
        if (settings) {
          if (settings.modeId) {
            const foundMode = { id: settings.modeId, name: 'RULES.' + settings.modeId.toUpperCase() };
            this.gameMode.set(foundMode);
          }
          if (settings.gameTypeId) {
            this.gameType.set({ id: settings.gameTypeId, name: 'RULES.TYPE_' + settings.gameTypeId.toUpperCase() });
          }
          if (settings.numImpostors !== undefined) this.impostors.set(settings.numImpostors);
          if (settings.numDetectives !== undefined) this.detectives.set(settings.numDetectives);
          if (settings.hints) this.hints.set(settings.hints);
          if (settings.duration) this.duration.set(settings.duration);
          if (settings.drawTurnTime !== undefined) this.drawTurnTime.set(settings.drawTurnTime);
        }
      }
    });

    effect(() => {
      const state = this.socketService.roomState();
      if (this.gameEngine.isOnline() && state && (state.status === 'reveal' || state.status === 'play')) {
        this.router.navigate(['/play']);
      }
    });

    effect(() => {
      if (this.gameEngine.isOnline() && this.isHost()) {
        const state = this.socketService.roomState();
        if (state && state.code) {
          const settings = {
            playerData: [],
            words: [],
            numImpostors: this.impostors(),
            numDetectives: this.detectives(),
            modeId: this.gameMode().id,
            gameTypeId: this.gameType().id as 'word' | 'question' | 'draw',
            duration: this.duration(),
            hints: this.hints(),
            drawTurnTime: this.drawTurnTime()
          };
          this.socketService.syncSettings(state.code, settings);
        }
      }
    });

    effect(() => {
      const error = this.socketService.errorMsg();
      if (error) {
        this.showAlert('ALERTS.TITLE_ERROR', `ALERTS.SOCKET_${error}`, true);
        this.socketService.errorMsg.set(null);
      }
    });
  }


  async ngOnInit() {
    await this.apiService.fetchPackages();
    this.restoreState();

    if (this.gameEngine.isOnline()) {
      this.activeScreen.set('online-connect');
      Preferences.get({ key: 'deceptra_player_name' }).then(({ value }) => {
        if (value) this.playerName.set(value);
      });
    }
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
        selectedPresetId: this.selectedPresetId(),
        selectedPresetName: this.selectedPresetName()
      };
      Preferences.set({ key: 'impostorSetupState', value: JSON.stringify(state) }).catch(e => {
        console.warn('Could not save setup state', e);
      });
    } catch (e) {
      console.warn('Could not serialize setup state', e);
    }
  }

  private async restoreState() {
    try {
      const { value: saved } = await Preferences.get({ key: 'impostorSetupState' });
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
        if (state.selectedPackages) {
          const availableIds = this.apiService.packages().map(p => p.id);
          // Preserve valid API packages and the custom package ID
          const validPackages = state.selectedPackages.filter((id: string) => availableIds.includes(id) || id === 'custom-main');
          this.selectedPackages.set(validPackages);
        }
        if (state.selectedPresetId !== undefined) this.selectedPresetId.set(state.selectedPresetId);
        if (state.selectedPresetName !== undefined) this.selectedPresetName.set(state.selectedPresetName);
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

  async createOnlineRoom() {
    if (!this.playerName().trim()) {
      this.showAlert('ALERTS.TITLE_ERROR', 'Por favor, introduce tu nombre.', true);
      return;
    }
    this.isConnecting.set(true);
    try {
      await this.socketService.createRoom(this.playerName().trim());
    } catch (err) {
      this.isConnecting.set(false);
      this.showAlert('ALERTS.TITLE_ERROR', 'Error al crear la sala.', true);
    }
  }

  async joinOnlineRoom() {
    if (!this.playerName().trim()) {
      this.showAlert('ALERTS.TITLE_ERROR', 'Por favor, introduce tu nombre.', true);
      return;
    }
    if (this.joinRoomCode().trim().length < 4) {
      this.showAlert('ALERTS.TITLE_ERROR', 'El código de sala debe ser de 4 caracteres.', true);
      return;
    }
    this.isConnecting.set(true);
    try {
      await this.socketService.joinRoom(this.joinRoomCode().trim().toUpperCase(), this.playerName().trim());
    } catch (err) {
      this.isConnecting.set(false);
      this.showAlert('ALERTS.TITLE_ERROR', 'Error al unirse a la sala.', true);
    }
  }

  copyRoomCode() {
    const code = this.socketService.roomState()?.code;
    if (code) {
      navigator.clipboard.writeText(code);
      this.showCopiedToast.set(true);
      setTimeout(() => this.showCopiedToast.set(false), 2000);
    }
  }

  goBack() {
    if (this.gameEngine.isOnline()) {
      this.socketService.disconnect();
    }
    this.router.navigate(['/']);
  }

  openPremium() {
    this.router.navigate(['/premium']);
  }
}
