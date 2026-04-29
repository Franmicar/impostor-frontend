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
import { TextHeaderComponent } from '../../shared/components/ui/text-header.component';
import { ModalComponent } from '../../shared/components/ui/modal.component';

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
  imports: [
    TranslateModule, CommonModule, FormsModule, SetupModes, SetupTypes, SetupPlayers, SetupPackages,
    ButtonPrimaryComponent, ButtonSecondaryComponent, IconButtonComponent, IconButtonMiniComponent,
    SelectComponent, TextHeaderComponent, ModalComponent
  ],
  template: `
  <div class="min-h-dvh bg-transparent text-textPrimary flex flex-col">
   
   <!-- Main Routing View Switcher -->
   @switch (activeScreen()) {
    
    <!-- ================= MAIN SETUP MENU ================= -->
    @case ('main') {
     <!-- Header -->
     <header class="flex items-center justify-between py-6 px-4 mb-2">
      <app-icon-button (onClick)="goBack()">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
       </svg>
      </app-icon-button>
      
      <app-text-header>Deceptra</app-text-header>
      
      <div class="flex items-center justify-end shrink-0 w-10">
       @if (authService.userSignal()) {
        <img [src]="authService.userSignal()?.photoURL || '/images/default-avatar.png'" class="w-8 h-8 rounded-full border-2 border-secondary shadow-[0_0_10px_rgb(var(--color-secondary)/0.4)] cursor-pointer" (click)="authService.logout()" title="Cerrar sesión" />
       } @else {
        <app-button-primary size="small" (onClick)="authService.loginWithGoogle()">
         Login
        </app-button-primary>
       }
      </div>
     </header>
     <main class="flex-1 px-4 overflow-y-auto relative custom-scrollbar" [ngClass]="billing.isPremium ? 'pb-20' : 'pb-40'">

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
          <h3 class="text-white font-bold tracking-wide">Comprar Premium</h3>
          <p class="text-xs text-textMuted">Quitar anuncios y temas exclusivos</p>
         </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-secondary">
         <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
       </div>
      }

      <p class="text-xs font-bold text-textMuted uppercase tracking-widest mb-4 ml-2">{{ 'SETUP.TITLE_MAIN' | translate }}</p>
      
      <div class="bg-glass backdrop-blur-md rounded-2xl border border-glass-border divide-y divide-glass-border shadow-xl">
       
       <!-- MODO DE JUEGO -->
       <div 
        (click)="activeScreen.set('modes')"
        class="flex items-center justify-between p-[0.8rem] hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer first:rounded-t-2xl">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-[72px] h-[72px]">
          <img [src]="themeService.getImagePath('/images/setup/mode.png')" alt="" class="w-full h-full object-cover neon-dynamic-img">
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
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </div>
       </div>

       <!-- TIPO DE JUEGO -->
       <div 
        (click)="activeScreen.set('types')"
        class="flex items-center justify-between p-[0.8rem] hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer border-b border-glass-border">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-[72px] h-[72px]">
          <img [src]="themeService.getImagePath('/images/setup/type.png')" alt="" class="w-full h-full object-cover neon-dynamic-img">
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
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </div>
       </div>

       <!-- JUGADORES -->
       <div 
        (click)="activeScreen.set('players')"
        class="flex items-center justify-between p-[0.8rem] hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-[72px] h-[72px]">
          <img [src]="themeService.getImagePath('/images/setup/players.png')" alt="" class="w-full h-full object-cover neon-dynamic-img">
         </div>
         <span class="font-semibold text-textPrimary flex items-center gap-2">
          {{ 'SETUP.PLAYERS' | translate }}
          <app-icon-button-mini (onClick)="infoModalKey.set('PLAYERS'); $event.stopPropagation()">
           <span class="font-serif italic font-black text-lg leading-none">i</span>
          </app-icon-button-mini>
         </span>
        </div>
        <div class="flex items-center gap-2 text-textMuted">
         <span class="text-sm font-medium">{{ players().length }}</span>
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </div>
       </div>

       <!-- IMPOSTORES -->
       @if (gameMode().id !== 'chaos' && gameMode().id !== 'fast') {
         <div class="flex items-center justify-between p-[0.8rem] hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3">
           <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-[72px] h-[72px]">
            <img [src]="themeService.getImagePath('/images/setup/impostors.png')" alt="" class="w-full h-full object-contain p-1 neon-dynamic-img">
           </div>
           <span class="font-semibold text-textPrimary flex items-center gap-2">
            {{ 'SETUP.IMPOSTORS' | translate }}
            <app-icon-button-mini (onClick)="infoModalKey.set('IMPOSTORS'); $event.stopPropagation()">
             <span class="font-serif italic font-black text-lg leading-none">i</span>
            </app-icon-button-mini>
           </span>
          </div>
          <div class="flex items-center gap-4 text-textPrimary">
           <app-icon-button-mini (onClick)="changeImpostors(-1)"><span class="text-[1.5rem] pb-[0.05rem] font-medium">&minus;</span></app-icon-button-mini>
           <span class="text-lg font-bold w-4 text-center">{{ impostors() }}</span>
           <app-icon-button-mini (onClick)="changeImpostors(1)"><span class="text-[1.5rem] pb-[0.05rem] font-medium">+</span></app-icon-button-mini>
          </div>
         </div>
       }

       <!-- DETECTIVES (Condicional) -->
       @if (gameMode().id === 'detective') {
        <div class="flex items-center justify-between p-[0.8rem] hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3">
           <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-[72px] h-[72px]">
            <img [src]="themeService.getImagePath('/images/setup/detectives.png')" alt="" class="w-full h-full object-contain p-1 neon-dynamic-img">
           </div>
           <span class="font-semibold text-textPrimary flex items-center gap-2">
             {{ 'SETUP.DETECTIVES' | translate }}
             <app-icon-button-mini (onClick)="infoModalKey.set('DETECTIVES'); $event.stopPropagation()">
              <span class="font-serif italic font-black text-lg leading-none">i</span>
             </app-icon-button-mini>
           </span>
          </div>
          <div class="flex items-center gap-4 text-textPrimary">
          <app-icon-button-mini (onClick)="changeDetectives(-1)"><span class="text-[1.5rem] pb-[0.05rem] font-medium">&minus;</span></app-icon-button-mini>
          <span class="text-lg font-bold w-4 text-center">{{ detectives() }}</span>
          <app-icon-button-mini (onClick)="changeDetectives(1)"><span class="text-[1.5rem] pb-[0.05rem] font-medium">+</span></app-icon-button-mini>
          </div>
        </div>
       }

       <!-- PISTAS -->
       @if (gameMode().id !== 'team' && gameMode().id !== 'infiltrator') {
         <div class="flex items-center justify-between p-[0.8rem] hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3">
           <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-[72px] h-[72px]">
            <img [src]="themeService.getImagePath('/images/setup/hints.png')" alt="" class="w-full h-full object-contain p-1 neon-dynamic-img">
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
            [options]="hintsOptions"
            [value]="hints()"
            (valueChange)="hints.set($event)">
          </app-select>
       </div>
       }

       <!-- PAQUETES -->
       <div 
        (click)="activeScreen.set('packages')"
        class="flex items-center justify-between p-[0.8rem] hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-[72px] h-[72px]">
          <img [src]="themeService.getImagePath('/images/setup/package.png')" alt="" class="w-full h-full object-cover neon-dynamic-img">
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
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </div>
       </div>

       <!-- DURACION -->
       <div class="flex items-center justify-between p-[0.8rem] hover:bg-white/5 transition-colors" [class.last:rounded-b-2xl]="gameType().id !== 'draw'" [class.border-b]="gameType().id === 'draw'" [class.border-glass-border]="gameType().id === 'draw'">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-[72px] h-[72px]">
          <img [src]="themeService.getImagePath('/images/setup/duration.png')" alt="" class="w-full h-full object-contain p-1 neon-dynamic-img">
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
            [options]="durationOptions"
            [value]="duration()"
            (valueChange)="duration.set($event)">
          </app-select>
       </div>

       <!-- TIEMPO DE DIBUJO -->
       @if(gameType().id === 'draw') {
       <div class="flex items-center justify-between p-[0.8rem] hover:bg-white/5 transition-colors last:rounded-b-2xl">
        <div class="flex items-center gap-3">
         <div class="setup-img-box flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-[72px] h-[72px]">
          <img [src]="themeService.getImagePath('/images/setup/turn_time.png')" alt="" class="w-full h-full object-contain p-1 neon-dynamic-img">
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
            [options]="drawTimeOptions"
            [value]="drawTurnTime()"
            (valueChange)="drawTurnTime.set($event)">
          </app-select>
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
     <footer class="fixed bottom-0 left-0 right-0 px-4 pt-8" [ngClass]="billing.isPremium ? 'pb-8' : 'pb-[96px]'">
      <!-- Fade for floating effect without solid bg -->
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent -z-10 w-full h-full pointer-events-none"></div>

      <app-button-primary 
        (onClick)="startGame()"
        [disabled]="!canStart() || apiService.isLoading()">
        {{ 'SETUP.START_GAME' | translate }}
      </app-button-primary>
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
      [ngClass]="alertModal().isError ? 'bg-glass border border-glass-border hover:bg-white/20 text-textPrimary' : 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_rgb(var(--color-primary)/0.4)]'">
      {{ 'COMMON.OK' | translate }}
     </button>
   </app-modal>

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
  private gameEngine = inject(GameEngineService);
  authService = inject(AuthService);
  private translate = inject(TranslateService);
  public billing = inject(BillingService);
  public themeService = inject(ThemeService);

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

  openPremium() {
    this.router.navigate(['/premium']);
  }
}
