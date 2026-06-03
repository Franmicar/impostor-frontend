import { Component, inject, signal, computed, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Capacitor } from '@capacitor/core';

import { AuthService } from '../../core/services/auth/auth.service';
import { ProfileService } from '../../core/services/profile/profile.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { UiService } from '../../core/services/ui/ui.service';

import { HeaderComponent } from '../../shared/components/ui/header.component';
import { CardComponent } from '../../shared/components/ui/card.component';
import { InputComponent } from '../../shared/components/ui/input.component';
import { ButtonPrimaryComponent } from '../../shared/components/ui/button-primary.component';
import { ButtonSecondaryComponent } from '../../shared/components/ui/button-secondary.component';
import { ModalComponent } from '../../shared/components/ui/modal.component';
import { FooterComponent } from '../../shared/components/ui/footer.component';
import { AvatarPickerModalComponent } from '../../shared/components/ui/avatar-picker-modal.component';
import { AvatarComponent } from '../../shared/components/ui/avatar.component';

import { CompleteUserProfile } from '../../core/models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    HeaderComponent,
    CardComponent,
    InputComponent,
    ButtonPrimaryComponent,
    ButtonSecondaryComponent,
    ModalComponent,
    FooterComponent,
    AvatarPickerModalComponent,
    AvatarComponent
  ],
  template: `
    <div class="flex flex-col min-h-dvh bg-transparent text-textPrimary">
      <!-- HEADER -->
      <app-header [showBack]="true" [title]="'PROFILE.TITLE' | translate" (onBack)="goBack()">
      </app-header>

      <div class="flex-1 px-6 pt-4 pb-32 flex flex-col w-full max-w-lg mx-auto space-y-6 overflow-y-auto custom-scrollbar">
        @if (!authService.isInitialized()) {
          <div class="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mb-4"></div>
            <p class="text-textMuted text-sm">{{ 'PROFILE.LOADING' | translate }}</p>
          </div>
        } @else if (authService.userSignal(); as user) {
          @if (profileService.profileSignal(); as completeProfile) {
            
            <!-- SECCIÓN 1: CABECERA DE IDENTIDAD -->
            <app-card class="relative block w-full">
              <div class="flex flex-col items-center justify-center text-center w-full py-2">
                <!-- Foto de perfil o avatar procedural -->
                <div class="group relative w-24 h-24 mt-6 mb-4 flex items-center justify-center cursor-pointer" (click)="openAvatarPicker()">
                  <app-avatar
                    [avatarId]="editFields.avatarId"
                    [avatarColor]="editFields.avatarColor || '#06b6d4'"
                    [avatarFrame]="editFields.avatarFrame"
                    [nickname]="editFields.nickname || editFields.firstName || '?'"
                    avatarSize="w-24 h-24"></app-avatar>

                  <!-- Overlay para personalizar (sombra hover) -->
                  <div class="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </div>
                </div>

                <!-- Color selector for the initials fallback (visible only if letter avatar is chosen) -->
                @if (!editFields.avatarId || editFields.avatarId.startsWith('/images/default-avatar')) {
                  <div class="flex flex-col items-center space-y-1.5 w-full mb-4">
                    <span class="text-[10px] font-bold text-textMuted uppercase tracking-wider">{{ 'AVATAR_PICKER.INITIAL_COLOR' | translate }}</span>
                    <div class="flex justify-center gap-2.5 flex-wrap">
                      @for (color of avatarColors; track color) {
                        <button (click)="editFields.avatarColor = color" 
                                [style.background-color]="color"
                                [class.ring-2]="editFields.avatarColor === color"
                                class="w-7 h-7 rounded-full border border-white/20 ring-secondary cursor-pointer transform hover:scale-110 active:scale-95 transition-all">
                        </button>
                      }
                    </div>
                  </div>
                }

                <!-- Nivel y Progresión -->
                <div class="flex flex-col items-center w-full space-y-1.5">
                  <span class="text-secondary text-xs font-bold uppercase tracking-wider">
                    {{ 'PROFILE.LEVEL' | translate }} {{ completeProfile.progression.level }}
                  </span>
                  <span class="text-textMuted text-xs font-bold uppercase tracking-wider">
                    {{ getLevelXP(completeProfile.progression.xp) }} / 100 XP
                  </span>
                  <div class="w-full max-w-[160px] h-2 bg-black/40 rounded-full border border-glass-border overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" 
                         [style.width.%]="getLevelXP(completeProfile.progression.xp)"></div>
                  </div>
                </div>
              </div>
            </app-card>

            <!-- SECCIÓN 2: FORMULARIO DE EDICIÓN -->
            <app-card>
              <h3 class="text-xs font-bold text-textMuted uppercase tracking-wider mb-4 border-b border-glass-border pb-2">
                {{ 'PROFILE.EDIT_ACCOUNT' | translate }}
              </h3>

              <div class="space-y-4">
                <!-- Apodo (Nickname) -->
                <div class="flex flex-col space-y-1.5">
                  <label class="text-xs font-bold text-textMuted uppercase tracking-wide">{{ 'PROFILE.NICKNAME' | translate }}</label>
                  <app-input
                    [placeholder]="'PROFILE.NICKNAME_PLACEHOLDER' | translate"
                    [maxlength]="15"
                    focusBorder="secondary"
                    [(ngModel)]="editFields.nickname">
                  </app-input>
                  @if (nicknameError()) {
                    <span class="text-xs text-rose-500 font-medium px-1">{{ getNicknameErrorText(nicknameError()) }}</span>
                  }
                </div>

                <!-- Nombre -->
                <div class="flex flex-col space-y-1.5">
                  <label class="text-xs font-bold text-textMuted uppercase tracking-wide">{{ 'PROFILE.FIRST_NAME' | translate }}</label>
                  <app-input
                    [placeholder]="'PROFILE.FIRST_NAME_PLACEHOLDER' | translate"
                    focusBorder="primary"
                    [(ngModel)]="editFields.firstName">
                  </app-input>
                </div>

                <!-- Apellidos -->
                <div class="flex flex-col space-y-1.5">
                  <label class="text-xs font-bold text-textMuted uppercase tracking-wide">{{ 'PROFILE.LAST_NAME' | translate }}</label>
                  <app-input
                    [placeholder]="'PROFILE.LAST_NAME_PLACEHOLDER' | translate"
                    focusBorder="primary"
                    [(ngModel)]="editFields.lastName">
                  </app-input>
                </div>

              </div>
            </app-card>

            <!-- SECCIÓN 3: CUADRÍCULA DE ESTADÍSTICAS [Desactivado para v2.1]
            <app-card>
              <div class="flex justify-between items-center mb-4 border-b border-glass-border pb-2">
                <h3 class="text-xs font-bold text-textMuted uppercase tracking-wider">
                  {{ 'PROFILE.STATS_TITLE' | translate }}
                </h3>
                <div class="flex bg-black/40 rounded-lg p-0.5 border border-glass-border">
                  <button (click)="statsTab.set('offline')"
                          [class.bg-glass]="statsTab() === 'offline'"
                          [class.text-secondary]="statsTab() === 'offline'"
                          class="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer">
                    Offline
                  </button>
                  <button (click)="statsTab.set('online')"
                          [class.bg-glass]="statsTab() === 'online'"
                          [class.text-secondary]="statsTab() === 'online'"
                          class="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer">
                    Online
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 text-center">
                <div class="bg-black/35 rounded-xl p-3 border border-glass-border/30">
                  <span class="text-[10px] text-textMuted uppercase font-bold tracking-wider block">{{ 'PROFILE.STATS_PLAYED' | translate }}</span>
                  <span class="text-xl font-black text-textPrimary">{{ activeStats().gamesPlayed }}</span>
                </div>
                <div class="bg-black/35 rounded-xl p-3 border border-glass-border/30">
                  <span class="text-[10px] text-textMuted uppercase font-bold tracking-wider block">{{ 'PROFILE.STATS_WON' | translate }}</span>
                  <span class="text-xl font-black text-green-400">{{ activeStats().gamesWon }}</span>
                </div>
                <div class="bg-black/35 rounded-xl p-3 border border-glass-border/30">
                  <span class="text-[10px] text-textMuted uppercase font-bold tracking-wider block">{{ 'PROFILE.STATS_WIN_RATE' | translate }}</span>
                  <span class="text-xl font-black text-secondary">{{ getWinRate(activeStats()) }}%</span>
                </div>
                <div class="bg-black/35 rounded-xl p-3 border border-glass-border/30">
                  <span class="text-[10px] text-textMuted uppercase font-bold tracking-wider block">{{ 'PROFILE.STATS_WIN_STREAK' | translate }}</span>
                  <span class="text-xl font-black text-orange-400">{{ activeStats().winStreak }} 🔥</span>
                </div>
                <div class="bg-black/35 rounded-xl p-3 border border-glass-border/30">
                  <span class="text-[10px] text-textMuted uppercase font-bold tracking-wider block">{{ 'PROFILE.STATS_IMPOSTOR' | translate }}</span>
                  <span class="text-xl font-black text-rose-500">{{ activeStats().timesImpostor }}</span>
                </div>
                <div class="bg-black/35 rounded-xl p-3 border border-glass-border/30">
                  <span class="text-[10px] text-textMuted uppercase font-bold tracking-wider block">{{ 'PROFILE.STATS_CORRECT_VOTES' | translate }}</span>
                  <span class="text-xl font-black text-cyan-400">{{ activeStats().correctVotes }}</span>
                </div>
              </div>
              <div class="text-center mt-3 text-[10px] text-textMuted">
                {{ 'PROFILE.STATS_PLAY_TIME' | translate }}: {{ getFormattedPlayTime(activeStats().totalPlayTimeSecs) }}
              </div>
            </app-card>
            -->

            <!-- SECCIÓN 4: LOGROS DESBLOQUEADOS [Desactivado para v2.1]
            <app-card>
              <h3 class="text-xs font-bold text-textMuted uppercase tracking-wider mb-3 border-b border-glass-border pb-2">
                {{ 'PROFILE.ACHIEVEMENTS' | translate }}
              </h3>

              <div class="space-y-3">
                @for (ach of mockAchievements; track ach.id) {
                  <div class="flex items-center gap-3 p-2.5 rounded-xl bg-black/25 border border-glass-border/30"
                       [class.opacity-55]="!completeProfile.progression.badges.includes(ach.id)">
                    <span class="text-2xl">{{ ach.icon }}</span>
                    <div class="flex-1 text-left">
                      <div class="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                        {{ ach.titleKey | translate }}
                        @if (completeProfile.progression.badges.includes(ach.id)) {
                          <span class="text-[8px] bg-green-500/20 text-green-400 px-1 rounded uppercase font-black tracking-wider">{{ 'PROFILE.UNLOCKED' | translate }}</span>
                        }
                      </div>
                      <div class="text-[10px] text-textMuted mt-0.5">{{ ach.descKey | translate }}</div>
                    </div>
                  </div>
                }
              </div>
            </app-card>
            -->

            <!-- BOTÓN DE LOGOUT -->
            <button (click)="openLogoutModal()" 
                    class="w-full py-4 bg-glass hover:bg-rose-950/20 border border-rose-500/30 text-rose-400 rounded-2xl font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] active:scale-98 uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              {{ 'AUTH_PROFILE.LOGOUT_BTN' | translate }}
            </button>

          } @else {
            <div class="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mb-4"></div>
              <p class="text-textMuted text-sm">{{ 'PROFILE.LOADING' | translate }}</p>
            </div>
          }
        } @else {
          <!-- SECCIÓN: INICIO DE SESIÓN REQUERIDO -->
          <div class="flex-1 flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto w-full">
            <span class="text-6xl mb-6 animate-bounce">🔑</span>
            <h2 class="text-2xl font-black uppercase tracking-wider mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {{ 'PROFILE.LOGIN_REQUIRED_TITLE' | translate }}
            </h2>
            <p class="text-sm text-textMuted mb-8 leading-relaxed">
              {{ 'PROFILE.LOGIN_REQUIRED_DESC' | translate }}
            </p>
            
            <div class="flex flex-col gap-3.5 w-full">
              <button (click)="signInWithGoogle()" class="w-full py-4 bg-white text-black font-bold rounded-2xl active:scale-95 transition-all text-center cursor-pointer uppercase tracking-widest flex items-center justify-center gap-2.5 text-xs shadow-md border border-slate-200">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                {{ 'AUTH_PROFILE.LOGIN_GOOGLE' | translate }}
              </button>
              @if (showAppleLogin) {
                <button (click)="signInWithApple()" class="w-full py-4 bg-white text-black font-bold rounded-2xl active:scale-95 transition-all text-center cursor-pointer uppercase tracking-widest flex items-center justify-center gap-2.5 text-xs shadow-md border border-slate-200">
                  <svg class="w-4 h-4 fill-current text-black" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.71-1.16 1.85-1.02 2.97 1.12.09 2.27-.56 2.97-1.41z"/></svg>
                  {{ 'AUTH_PROFILE.LOGIN_APPLE' | translate }}
                </button>
              }
            </div>
          </div>
        }
      </div>

      <!-- FOOTER DE GUARDADO -->
      @if (authService.userSignal(); as user) {
        @if (profileService.profileSignal(); as completeProfile) {
          <app-footer>
            <app-button-primary 
              [disabled]="isProfileSaving() || !isProfileModified(completeProfile)"
              (onClick)="saveAllProfileData()"
              class="w-full">
              {{ isProfileSaving() ? ('PROFILE.SAVING' | translate) : ('PROFILE.SAVE' | translate) }}
            </app-button-primary>
          </app-footer>
        }
      }

      <!-- MODAL ALERTA -->
      <app-modal
        [isOpen]="alertModal().show"
        [title]="alertModal().title"
        [icon]="alertModal().isError ? 'error' : 'success'"
        (onClose)="alertModal.set({show: false, title: '', message: '', isError: false})">
        
        <p class="text-base text-textMuted mb-4 w-full text-center">{{ alertModal().message }}</p>
        
        <app-button-primary modal-footer (onClick)="alertModal.set({show: false, title: '', message: '', isError: false})" class="w-full">
          {{ 'COMMON.OK' | translate }}
        </app-button-primary>
      </app-modal>

      <!-- TOAST DE ÉXITO AL GUARDAR PERFIL -->
      @if (showSuccessToast()) {
        <div class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-5 py-3 rounded-full border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)] backdrop-blur-md z-50 flex items-center gap-2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4 text-green-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span class="text-xs font-semibold tracking-wide">{{ 'CUSTOM_PACKAGE.SAVE_SUCCESS' | translate }}</span>
        </div>
      }

      <!-- MODAL SELECTOR DE AVATAR -->
      <app-avatar-picker-modal
        [isOpen]="showAvatarPickerModal"
        [title]="'PROFILE.CUSTOMIZE_AVATAR' | translate"
        [avatarId]="editFields.avatarId"
        [avatarFrame]="editFields.avatarFrame"
        [avatarColor]="editFields.avatarColor"
        [nickname]="editFields.nickname"
        (onClose)="showAvatarPickerModal = false"
        (onCustomPhotoCropped)="onProfilePhotoCropped($event)"
        (onSave)="saveProfileAvatar($event)">
      </app-avatar-picker-modal>

      <!-- MODAL DE CIERRE DE SESIÓN -->
      <app-modal
        [isOpen]="isLogoutModalOpen()"
        [title]="'AUTH_PROFILE.LOGOUT_TITLE' | translate"
        icon="error"
        (onClose)="isLogoutModalOpen.set(false)">
        
        <p class="text-sm text-textMuted mb-4 w-full text-center">
          {{ 'AUTH_PROFILE.LOGOUT_CONFIRM' | translate }}
        </p>
        
        <div modal-footer class="w-full flex gap-3">
          <app-button-secondary (onClick)="isLogoutModalOpen.set(false)" class="flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            {{ 'COMMON.CANCEL' | translate }}
          </app-button-secondary>
          <button (click)="confirmLogout()" class="flex-1 py-3 bg-gradient-to-r from-rose-500 to-rose-700 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-95 uppercase tracking-widest text-xs cursor-pointer">
            {{ 'AUTH_PROFILE.LOGOUT_BTN' | translate }}
          </button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    /* Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 99px;
    }
  `]
})
export class ProfileComponent {
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  themeService = inject(ThemeService);
  private router = inject(Router);
  private uiService = inject(UiService);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  showAppleLogin = Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'web';

  // Tab control signal (offline / online statistics)
  statsTab = signal<'offline' | 'online'>('offline');

  // Input editing fields
  editFields = {
    nickname: '',
    firstName: '',
    lastName: '',
    avatarColor: '',
    avatarId: '',
    avatarFrame: ''
  };

  // State control signals
  isProfileSaving = signal(false);
  isNicknameSaving = signal(false);
  nicknameError = signal<string | null>(null);
  isLogoutModalOpen = signal(false);
  alertModal = signal({ show: false, title: '', message: '', isError: false });
  showSuccessToast = signal(false);

  // Avatar Picker
  showAvatarPickerModal = false;

  // Preset avatar colors
  avatarColors = ['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  // Mock progression achievements list
  mockAchievements = [
    { id: 'first_win', icon: '🏆', titleKey: 'PROFILE.ACH_1_TITLE', descKey: 'PROFILE.ACH_1_DESC' },
    { id: 'first_impostor', icon: '😈', titleKey: 'PROFILE.ACH_2_TITLE', descKey: 'PROFILE.ACH_2_DESC' },
    { id: 'detective_pro', icon: '🔍', titleKey: 'PROFILE.ACH_3_TITLE', descKey: 'PROFILE.ACH_3_DESC' },
    { id: 'neon_collector', icon: '🎨', titleKey: 'PROFILE.ACH_4_TITLE', descKey: 'PROFILE.ACH_4_DESC' }
  ];

  constructor() {
    // Populate form fields dynamically when the profile loads
    effect(() => {
      const completeProfile = this.profileService.profileSignal();
      if (completeProfile) {
        this.editFields.nickname = completeProfile.profile.nickname || '';
        this.editFields.firstName = completeProfile.profile.firstName || '';
        this.editFields.lastName = completeProfile.profile.lastName || '';
        this.editFields.avatarColor = completeProfile.profile.avatarColor || '#06b6d4';
        this.editFields.avatarId = completeProfile.profile.avatarId || '';
        this.editFields.avatarFrame = completeProfile.profile.avatarFrame || '';
        this.cdr.detectChanges();
      }
    });
  }

  // Active statistics based on the active tab
  activeStats = computed(() => {
    const profile = this.profileService.profileSignal();
    if (!profile) {
      return { gamesPlayed: 0, gamesWon: 0, timesImpostor: 0, totalPlayTimeSecs: 0, correctVotes: 0, winStreak: 0 };
    }
    return this.statsTab() === 'offline' ? profile.stats.offline : profile.stats.online;
  });

  goBack() {
    this.router.navigate(['/']);
  }

  getLevelXP(xp: number): number {
    return xp % 100;
  }

  getWinRate(stats: any): number {
    if (!stats.gamesPlayed) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  }

  getFormattedPlayTime(seconds: number): string {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // --- Profile Fields Saving ---

  isProfileModified(completeProfile: CompleteUserProfile): boolean {
    return (
      this.editFields.nickname.trim() !== (completeProfile.profile.nickname || '') ||
      this.editFields.firstName.trim() !== (completeProfile.profile.firstName || '') ||
      this.editFields.lastName.trim() !== (completeProfile.profile.lastName || '') ||
      this.editFields.avatarColor !== (completeProfile.profile.avatarColor || '#06b6d4') ||
      this.editFields.avatarId !== (completeProfile.profile.avatarId || '') ||
      this.editFields.avatarFrame !== (completeProfile.profile.avatarFrame || '')
    );
  }

  getNicknameErrorKey(errorKey: string | null): string {
    if (!errorKey) return '';
    switch (errorKey) {
      case 'INVALID_CHARACTERS':
        return 'PROFILE.ERR_INVALID_CHARS';
      case 'NICKNAME_TAKEN':
        return 'PROFILE.ERR_TAKEN';
      case 'NO_ACTIVE_SESSION':
        return 'PROFILE.ERR_NO_SESSION';
      default:
        return 'PROFILE.ERR_DEFAULT';
    }
  }

  async saveAllProfileData() {
    const current = this.profileService.profileSignal();
    if (!current) return;

    this.isProfileSaving.set(true);
    this.nicknameError.set(null);

    const newNickname = this.editFields.nickname.trim();

    // 1. Nickname change
    if (newNickname !== current.profile.nickname) {
      if (!/^[a-zA-Z0-9_]{3,15}$/.test(newNickname.toLowerCase())) {
        this.isProfileSaving.set(false);
        this.nicknameError.set('INVALID_CHARACTERS');
        this.showAlert('ALERTS.TITLE_ERROR', 'PROFILE.ERR_INVALID_CHARS', true);
        return;
      }

      const result = await this.profileService.changeNickname(newNickname);
      if (!result.success) {
        this.isProfileSaving.set(false);
        this.nicknameError.set(result.error || 'NICKNAME_ERROR');
        this.showAlert('ALERTS.TITLE_ERROR', this.getNicknameErrorKey(result.error || 'NICKNAME_ERROR'), true);
        return;
      }
    }

    // 2. Other profile fields
    if (
      this.editFields.firstName !== current.profile.firstName ||
      this.editFields.lastName !== current.profile.lastName ||
      this.editFields.avatarColor !== current.profile.avatarColor ||
      this.editFields.avatarId !== current.profile.avatarId ||
      this.editFields.avatarFrame !== current.profile.avatarFrame
    ) {
      const success = await this.profileService.updateProfile({
        firstName: this.editFields.firstName,
        lastName: this.editFields.lastName,
        avatarColor: this.editFields.avatarColor,
        avatarId: this.editFields.avatarId,
        avatarFrame: this.editFields.avatarFrame
      });
      if (!success && navigator.onLine) {
        this.isProfileSaving.set(false);
        this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.SAVE_ERROR', true);
        return;
      }
    }

    this.isProfileSaving.set(false);
    this.showSuccessToast.set(true);
    setTimeout(() => this.showSuccessToast.set(false), 3000);
  }

  showAlert(titleKey: string, messageKey: string, isError: boolean = false) {
    const title = this.translate.instant(titleKey);
    const message = this.translate.instant(messageKey);
    this.alertModal.set({ show: true, title, message, isError });
  }

  getNicknameErrorText(errorKey: string | null): string {
    if (!errorKey) return '';
    switch (errorKey) {
      case 'INVALID_CHARACTERS':
        return this.translate.instant('PROFILE.ERR_INVALID_CHARS');
      case 'NICKNAME_TAKEN':
        return this.translate.instant('PROFILE.ERR_TAKEN');
      case 'NO_ACTIVE_SESSION':
        return this.translate.instant('PROFILE.ERR_NO_SESSION');
      default:
        return this.translate.instant('PROFILE.ERR_DEFAULT');
    }
  }

  // --- Photo Upload & Cropper Handlers ---

  openAvatarPicker() {
    this.showAvatarPickerModal = true;
  }

  async onProfilePhotoCropped(blob: Blob) {
    this.uiService.setLoading(true);
    const downloadURL = await this.profileService.uploadAvatarPhoto(blob);
    this.uiService.setLoading(false);

    if (downloadURL) {
      this.editFields.avatarId = downloadURL;
    } else {
      this.showAlert('ALERTS.TITLE_ERROR', 'PROFILE.UPLOAD_FAILED', true);
    }
  }

  saveProfileAvatar(selection: { avatarId: string; avatarColor: string; avatarFrame: string }) {
    this.editFields.avatarId = selection.avatarId;
    this.editFields.avatarColor = selection.avatarColor;
    this.editFields.avatarFrame = selection.avatarFrame;
    this.showAvatarPickerModal = false;
  }

  // --- Session Logout ---

  openLogoutModal() {
    this.isLogoutModalOpen.set(true);
  }

  confirmLogout() {
    this.isLogoutModalOpen.set(false);
    this.authService.logout();
  }

  async signInWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
    } catch (error) {
      console.error('Google Sign-In failed', error);
      this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.LOGIN_ERROR', true);
    }
  }

  async signInWithApple() {
    try {
      await this.authService.loginWithApple();
    } catch (error) {
      console.error('Apple Sign-In failed', error);
      this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.LOGIN_ERROR', true);
    }
  }
}
