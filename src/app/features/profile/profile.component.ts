import { Component, inject, signal, computed, ViewChild, ElementRef, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

import { AuthService } from '../../core/services/auth/auth.service';
import { ProfileService } from '../../core/services/profile/profile.service';
import { ThemeService } from '../../core/services/theme.service';
import { UiService } from '../../core/services/ui/ui.service';

import { HeaderComponent } from '../../shared/components/ui/header.component';
import { CardComponent } from '../../shared/components/ui/card.component';
import { InputComponent } from '../../shared/components/ui/input.component';
import { ButtonPrimaryComponent } from '../../shared/components/ui/button-primary.component';
import { ButtonSecondaryComponent } from '../../shared/components/ui/button-secondary.component';
import { ModalComponent } from '../../shared/components/ui/modal.component';
import { FooterComponent } from '../../shared/components/ui/footer.component';

import { CompleteUserProfile } from '../../core/models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ImageCropperComponent,
    HeaderComponent,
    CardComponent,
    InputComponent,
    ButtonPrimaryComponent,
    ButtonSecondaryComponent,
    ModalComponent,
    FooterComponent
  ],
  template: `
    <div class="flex flex-col min-h-dvh bg-transparent text-textPrimary">
      <!-- HEADER -->
      <app-header [showBack]="true" [title]="'PROFILE.TITLE' | translate" (onBack)="goBack()">
      </app-header>

      <div class="flex-1 px-6 pt-4 pb-32 flex flex-col w-full max-w-lg mx-auto space-y-6 overflow-y-auto custom-scrollbar">
        @if (authService.userSignal(); as user) {
          @if (profileService.profileSignal(); as completeProfile) {
            
            <!-- SECCIÓN 1: CABECERA DE IDENTIDAD -->
            <app-card class="relative flex flex-col items-center p-6 text-center">
              
              <!-- Foto de perfil o avatar procedural -->
              <div class="group relative w-24 h-24 mb-4">
                @if (completeProfile.profile.avatarId && !completeProfile.profile.avatarId.startsWith('/images/default-avatar')) {
                  <img [src]="completeProfile.profile.avatarId" 
                       class="w-full h-full rounded-full object-cover border-2 border-secondary shadow-[0_0_15px_rgb(var(--color-secondary)/0.4)]"
                       alt="Avatar" />
                } @else {
                  <!-- Fallback: Inicial de apodo con color de fondo dinámico -->
                  <div [style.background]="editFields.avatarColor || '#06b6d4'" 
                       class="w-full h-full rounded-full flex items-center justify-center text-white text-4xl font-black border-2 border-secondary shadow-[0_0_15px_rgb(var(--color-secondary)/0.4)] transition-all">
                    {{ editFields.nickname ? editFields.nickname.charAt(0).toUpperCase() : '?' }}
                  </div>
                }

                <!-- Overlay para subir foto -->
                <button (click)="triggerPhotoUpload()" 
                        class="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </button>
                <input type="file" #photoInput class="hidden" accept="image/*" (change)="onFileSelected($event)" />
              </div>

              <!-- Nivel y Progresión -->
              <div class="w-full mt-2">
                <div class="flex justify-between text-xs font-bold uppercase tracking-wider mb-1 px-1">
                  <span class="text-secondary">{{ 'PROFILE.LEVEL' | translate }} {{ completeProfile.progression.level }}</span>
                  <span class="text-textMuted">{{ getLevelXP(completeProfile.progression.xp) }} / 100 XP</span>
                </div>
                <div class="w-full h-2 bg-black/40 rounded-full border border-glass-border overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" 
                       [style.width.%]="getLevelXP(completeProfile.progression.xp)"></div>
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

                <!-- Color de Avatar (Selector visual rápido) -->
                <div class="flex flex-col space-y-1.5">
                  <label class="text-xs font-bold text-textMuted uppercase tracking-wide">{{ 'PROFILE.AVATAR_COLOR' | translate }}</label>
                  <div class="flex justify-between items-center py-2 px-1">
                    @for (color of avatarColors; track color) {
                      <button (click)="editFields.avatarColor = color" 
                              [style.background-color]="color"
                              [class.ring-2]="editFields.avatarColor === color"
                              class="w-8 h-8 rounded-full border border-white/20 ring-secondary cursor-pointer transform hover:scale-110 active:scale-95 transition-all">
                      </button>
                    }
                  </div>
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
          <div class="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <app-card class="max-w-sm p-8 flex flex-col items-center">
              <span class="text-5xl mb-4 animate-bounce">🔑</span>
              <h2 class="text-lg font-black uppercase tracking-wider mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {{ 'PROFILE.LOGIN_REQUIRED_TITLE' | translate }}
              </h2>
              <p class="text-xs text-textMuted mb-6 leading-relaxed">
                {{ 'PROFILE.LOGIN_REQUIRED_DESC' | translate }}
              </p>
              <app-button-primary (onClick)="authService.loginWithGoogle()" class="w-full">
                {{ 'AUTH_PROFILE.LOGIN' | translate }}
              </app-button-primary>
            </app-card>
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

      <!-- MODAL RECORTAR IMAGEN -->
      <app-modal
        [isOpen]="showCropModal"
        [title]="'SETUP_PLAYERS.CROP_TITLE' | translate"
        [preventCloseOutside]="true"
        (onClose)="cancelCrop()">
        
        <div class="w-full h-64 bg-black/50 border border-slate-700 rounded-xl overflow-hidden relative flex items-center justify-center mb-2">
          <image-cropper
            [imageChangedEvent]="imageChangedEvent"
            [maintainAspectRatio]="true"
            [aspectRatio]="1 / 1"
            [resizeToWidth]="200"
            format="jpeg"
            (imageCropped)="onImageCropped($event)"
            (loadImageFailed)="loadImageFailed()"
            style="max-height: 250px; max-width: 100%; margin: auto;"
          ></image-cropper>
        </div>
        
        <div modal-footer class="flex gap-3 w-full mt-2">
          <app-button-secondary (onClick)="cancelCrop()" class="flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            {{ 'SETUP_PLAYERS.CROP_CANCEL' | translate }}
          </app-button-secondary>
          <app-button-primary (onClick)="confirmCrop()" class="flex-1">
            {{ 'SETUP_PLAYERS.CROP_APPLY' | translate }}
          </app-button-primary>
        </div>
      </app-modal>

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
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 99px;
    }
  `]
})
export class ProfileComponent {
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  private router = inject(Router);
  private uiService = inject(UiService);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  // Tab control signal (offline / online statistics)
  statsTab = signal<'offline' | 'online'>('offline');

  // Input editing fields
  editFields = {
    nickname: '',
    firstName: '',
    lastName: '',
    avatarColor: ''
  };

  // State control signals
  isProfileSaving = signal(false);
  isNicknameSaving = signal(false);
  nicknameError = signal<string | null>(null);
  isLogoutModalOpen = signal(false);
  alertModal = signal({ show: false, title: '', message: '', isError: false });

  // Cropping variables
  showCropModal = false;
  imageChangedEvent: any = '';
  croppedImageBlob: Blob | null = null;

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
      this.editFields.avatarColor !== (completeProfile.profile.avatarColor || '#06b6d4')
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
      this.editFields.avatarColor !== current.profile.avatarColor
    ) {
      const success = await this.profileService.updateProfile({
        firstName: this.editFields.firstName,
        lastName: this.editFields.lastName,
        avatarColor: this.editFields.avatarColor
      });
      if (!success && navigator.onLine) {
        this.isProfileSaving.set(false);
        this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.SAVE_ERROR', true);
        return;
      }
    }

    this.isProfileSaving.set(false);
    this.showAlert('ALERTS.TITLE_SUCCESS', 'CUSTOM_PACKAGE.SAVE_SUCCESS', false);
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

  triggerPhotoUpload() {
    this.photoInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size up to 5MB
      if (file.size > 5 * 1024 * 1024) {
        this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.IMAGE_TOO_LARGE', true);
        return;
      }
      this.imageChangedEvent = event;
      this.showCropModal = true;
    }
  }

  onImageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob = event.blob || null;
  }

  loadImageFailed() {
    this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.IMAGE_TOO_LARGE', true);
    this.cancelCrop();
  }

  cancelCrop() {
    this.showCropModal = false;
    this.imageChangedEvent = '';
    this.croppedImageBlob = null;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
  }

  async confirmCrop() {
    if (this.croppedImageBlob) {
      this.uiService.setLoading(true);
      const downloadURL = await this.profileService.uploadAvatarPhoto(this.croppedImageBlob);
      this.uiService.setLoading(false);
      this.cancelCrop();
      
      if (!downloadURL) {
        this.showAlert('ALERTS.TITLE_ERROR', 'PROFILE.UPLOAD_FAILED', true);
      }
    }
  }

  // --- Session Logout ---

  openLogoutModal() {
    this.isLogoutModalOpen.set(true);
  }

  confirmLogout() {
    this.isLogoutModalOpen.set(false);
    this.authService.logout();
  }
}
