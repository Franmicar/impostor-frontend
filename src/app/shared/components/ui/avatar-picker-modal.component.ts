import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, input, output, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { BillingService } from '../../../core/services/billing.service';
import { ModalComponent } from './modal.component';
import { ButtonPrimaryComponent } from './button-primary.component';
import { ButtonSecondaryComponent } from './button-secondary.component';
import { AvatarComponent } from './avatar.component';

@Component({
  selector: 'app-avatar-picker-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ImageCropperComponent,
    ModalComponent,
    ButtonPrimaryComponent,
    ButtonSecondaryComponent,
    AvatarComponent
  ],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [title]="title()"
      (onClose)="cancelSelection()">
      
      <div class="flex flex-col space-y-4 pb-4">
        <!-- Pestañas (Tabs) -->
        @if (showFrames()) {
          <div class="flex bg-black/40 rounded-lg p-0.5 border border-glass-border">
            <button (click)="avatarPickerTab.set('avatar')"
                    [class.bg-glass]="avatarPickerTab() === 'avatar'"
                    [class.text-secondary]="avatarPickerTab() === 'avatar'"
                    [class.text-textMuted]="avatarPickerTab() !== 'avatar'"
                    class="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer">
              {{ 'AVATAR_PICKER.TAB_AVATAR' | translate }}
            </button>
            <button (click)="avatarPickerTab.set('frame')"
                    [class.bg-glass]="avatarPickerTab() === 'frame'"
                    [class.text-secondary]="avatarPickerTab() === 'frame'"
                    [class.text-textMuted]="avatarPickerTab() !== 'frame'"
                    class="flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer">
              {{ 'AVATAR_PICKER.TAB_FRAME' | translate }}
            </button>
          </div>
        }

        <!-- SECCIÓN: AVATAR CUSTOMIZATION -->
        @if (avatarPickerTab() === 'avatar') {
          <!-- 1. Opción Letras Fallback -->
          @if (showInitials()) {
            <div class="flex flex-col items-center bg-black/20 border border-glass-border/30 rounded-2xl p-4 space-y-3">
              <span class="text-xs font-bold text-textMuted uppercase tracking-wide">{{ 'AVATAR_PICKER.INITIAL_AVATAR' | translate }}</span>
              
              <!-- Circular Letter Preview -->
              <button 
                (click)="tempAvatarId.set('/images/default-avatar.png')"
                [style.background]="tempAvatarColor()"
                [class.ring-4]="tempAvatarId().startsWith('/images/default-avatar')"
                class="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-black ring-secondary transition-all cursor-pointer uppercase select-none">
                {{ nickname() ? nickname().charAt(0).toUpperCase() : '?' }}
              </button>
              
              <!-- Color selector for initials fallback -->
              <div class="flex flex-col items-center space-y-1.5 w-full">
                <span class="text-[10px] font-bold text-textMuted uppercase tracking-wider">{{ 'AVATAR_PICKER.INITIAL_COLOR' | translate }}</span>
                <div class="flex justify-center gap-2.5 flex-wrap">
                  @for (color of avatarColors; track color) {
                    <button (click)="tempAvatarColor.set(color)" 
                            [style.background-color]="color"
                            [class.ring-2]="tempAvatarColor() === color"
                            class="w-7 h-7 rounded-full border border-white/20 ring-secondary cursor-pointer transform hover:scale-110 active:scale-95 transition-all">
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- 2. Avatar con Foto Custom -->
          <div class="flex flex-col items-center bg-black/20 border border-glass-border/30 rounded-2xl p-4 space-y-3">
            <span class="text-xs font-bold text-textMuted uppercase tracking-wide">{{ 'AVATAR_PICKER.PHOTO_AVATAR' | translate }}</span>
            <button (click)="triggerCustomAvatarUpload()"
                    class="relative w-16 h-16 rounded-full bg-white/5 border border-glass-border hover:bg-white/10 hover:border-secondary flex items-center justify-center text-textPrimary active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.05)] overflow-hidden group">
              @if (tempAvatarId() && (tempAvatarId().startsWith('http') || tempAvatarId().startsWith('blob:') || tempAvatarId().startsWith('data:'))) {
                <img [src]="tempAvatarId()" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-7 h-7">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              }
            </button>
          </div>

          <input type="file" #photoInput class="hidden" accept="image/*" (change)="onFileSelected($event)" />

          <!-- 3. Lista horizontal de avatares de temas -->
          <div class="flex flex-col space-y-2 w-full overflow-hidden">
            <span class="text-xs font-bold text-textMuted uppercase tracking-wide">{{ 'AVATAR_PICKER.GAME_AVATARS' | translate }}</span>
            <div class="flex flex-row gap-3 p-1 pb-2.5 overflow-x-scroll custom-scrollbar w-full">
              @for (avatarInfo of getAvailableAvatars(); track avatarInfo.key) {
                <button
                  (click)="tempAvatarId.set(avatarInfo.url)"
                  [class.border-secondary]="tempAvatarId() === avatarInfo.url"
                  [class.ring-4]="tempAvatarId() === avatarInfo.url"
                  [class.ring-secondary]="tempAvatarId() === avatarInfo.url"
                  class="relative w-16 h-16 shrink-0 rounded-2xl border border-glass-border bg-white/5 hover:border-secondary hover:bg-white/10 active:scale-95 transition-all p-0 overflow-hidden flex items-center justify-center group cursor-pointer">
                  <img [src]="avatarInfo.url" class="w-full h-full object-cover rounded-xl" />
                </button>
              }
            </div>
          </div>
        }

        <!-- SECCIÓN: FRAME CUSTOMIZATION -->
        @if (avatarPickerTab() === 'frame') {
          <div class="flex flex-col space-y-2">
            <span class="text-xs font-bold text-textMuted uppercase tracking-wide">{{ 'AVATAR_PICKER.AVATAR_FRAMES' | translate }}</span>
            <div class="grid grid-cols-3 gap-3 p-1 max-h-80 overflow-y-auto custom-scrollbar">
              
              <!-- Opción: Sin Marco -->
              <button
                (click)="tempAvatarFrame.set('')"
                [class.border-secondary]="tempAvatarFrame() === ''"
                [class.ring-4]="tempAvatarFrame() === ''"
                [class.ring-secondary]="tempAvatarFrame() === ''"
                class="relative w-full aspect-square rounded-2xl border border-glass-border bg-white/5 hover:border-secondary hover:bg-white/10 active:scale-95 transition-all p-3 flex flex-col items-center justify-center group cursor-pointer text-center">
                <span class="text-2xl mb-1">🚫</span>
                <span class="text-[10px] font-bold text-textMuted uppercase tracking-wider">{{ 'AVATAR_PICKER.NO_FRAME' | translate }}</span>
              </button>

              <!-- Marcos disponibles -->
              @for (frameInfo of getAvailableFrames(); track frameInfo.theme) {
                <button
                  (click)="tempAvatarFrame.set(frameInfo.theme)"
                  [class.border-secondary]="tempAvatarFrame() === frameInfo.theme"
                  [class.ring-4]="tempAvatarFrame() === frameInfo.theme"
                  [class.ring-secondary]="tempAvatarFrame() === frameInfo.theme"
                  class="relative w-full aspect-square rounded-2xl border border-glass-border bg-white/5 hover:border-secondary hover:bg-white/10 active:scale-95 transition-all p-1 flex items-center justify-center group cursor-pointer">
                  
                  <!-- Preview inside frame -->
                  <app-avatar
                    [avatarId]="tempAvatarId()"
                    [avatarColor]="tempAvatarColor()"
                    [avatarFrame]="frameInfo.theme"
                    [nickname]="nickname()"
                    avatarSize="w-12 h-12"></app-avatar>
                  
                  <!-- Label theme name -->
                  <span class="absolute bottom-1 text-[8px] uppercase tracking-wider text-textMuted font-bold">
                    {{ frameInfo.theme }}
                  </span>
                </button>
              }
            </div>
          </div>
        }
      </div>

      <div modal-footer class="w-full flex items-center gap-3">
        <app-button-secondary (onClick)="cancelSelection()" class="flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          {{ 'COMMON.CANCEL' | translate }}
        </app-button-secondary>
        <app-button-primary (onClick)="confirmSelection()" class="flex-1">
          {{ 'SETUP.SAVE' | translate }}
        </app-button-primary>
      </div>
    </app-modal>

    <!-- MODAL RECORTAR IMAGEN -->
    <app-modal
      [isOpen]="showCropModal()"
      [title]="'SETUP_PLAYERS.CROP_TITLE' | translate"
      [preventCloseOutside]="true"
      (onClose)="cancelCrop()">
      
      <div class="w-full h-64 bg-black/50 border border-slate-700 rounded-xl relative flex items-center justify-center mb-2">
        <image-cropper
          [imageChangedEvent]="imageChangedEvent()"
          [maintainAspectRatio]="true"
          [aspectRatio]="1 / 1"
          [resizeToWidth]="200"
          format="jpeg"
          (imageCropped)="onImageCropped($event)"
          (loadImageFailed)="loadImageFailed()"
          style="max-height: 250px; max-width: 100%; margin: auto;"
        ></image-cropper>
      </div>
      
      <div modal-footer class="flex items-center gap-3 w-full mt-2">
        <app-button-secondary (onClick)="cancelCrop()" class="flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          {{ 'SETUP_PLAYERS.CROP_CANCEL' | translate }}
        </app-button-secondary>
        <app-button-primary (onClick)="confirmCrop()" class="flex-1">
          {{ 'SETUP_PLAYERS.CROP_APPLY' | translate }}
        </app-button-primary>
      </div>
    </app-modal>
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
export class AvatarPickerModalComponent {
  themeService = inject(ThemeService);
  billing = inject(BillingService);

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  // Input bindings
  isOpen = input<boolean>(false);
  title = input<string>('Personalizar Avatar');
  avatarId = input<string>('');
  avatarFrame = input<string>('');
  avatarColor = input<string>('#06b6d4');
  nickname = input<string>('');
  showFrames = input<boolean>(true);
  showInitials = input<boolean>(true);

  // Output events
  onSave = output<{ avatarId: string; avatarColor: string; avatarFrame: string }>();
  onCustomPhotoCropped = output<Blob>();
  onClose = output<void>();

  // Temporary picker state
  tempAvatarId = signal<string>('');
  tempAvatarColor = signal<string>('');
  tempAvatarFrame = signal<string>('');
  avatarPickerTab = signal<string>('avatar');

  // Cropper state
  showCropModal = signal<boolean>(false);
  imageChangedEvent = signal<any>('');
  croppedImageBlob = signal<Blob | null>(null);

  avatarColors = ['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.tempAvatarId.set(this.avatarId() || '/images/default-avatar.png');
        this.tempAvatarColor.set(this.avatarColor() || '#06b6d4');
        this.tempAvatarFrame.set(this.avatarFrame() || '');
        this.avatarPickerTab.set('avatar');
      }
    });
  }

  getAvailableAvatars(): { key: string; url: string }[] {
    const themes: Theme[] = ['neon', 'neon2', 'infantil', 'alien', 'manga'];
    const list: { key: string; url: string }[] = [];

    for (const t of themes) {
      let isAvailable = false;
      if (t === 'neon' || t === 'infantil') {
        isAvailable = true;
      } else if (t === 'neon2') {
        isAvailable = this.billing.isPremium;
      } else if (t === 'alien') {
        isAvailable = this.billing.isThemeAlienOwned;
      } else if (t === 'manga') {
        isAvailable = this.billing.isThemeMangaOwned;
      }

      if (isAvailable) {
        const avatars = this.themeService.getThemeAvatars(t);
        for (const key of avatars) {
          list.push({
            key,
            url: this.themeService.resolveAsset('avatars.' + key)
          });
        }
      }
    }
    return list;
  }

  getAvailableFrames(): { theme: string; url: string }[] {
    const themes: Theme[] = ['neon', 'neon2', 'infantil', 'alien', 'manga'];
    const list: { theme: string; url: string }[] = [];

    for (const t of themes) {
      let isAvailable = false;
      if (t === 'neon' || t === 'infantil') {
        isAvailable = true;
      } else if (t === 'neon2') {
        isAvailable = this.billing.isPremium;
      } else if (t === 'alien') {
        isAvailable = this.billing.isThemeAlienOwned;
      } else if (t === 'manga') {
        isAvailable = this.billing.isThemeMangaOwned;
      }

      if (isAvailable) {
        list.push({
          theme: t,
          url: this.themeService.getFrameAsset(t)
        });
      }
    }
    return list;
  }

  triggerCustomAvatarUpload() {
    if (this.photoInput) {
      this.photoInput.nativeElement.click();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // Enlaza alert de error o deja que se maneje. Para simplificar, reseteamos.
        return;
      }
      this.imageChangedEvent.set(event);
      this.showCropModal.set(true);
    }
  }

  onImageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob.set(event.blob || null);
  }

  loadImageFailed() {
    this.cancelCrop();
  }

  cancelCrop() {
    this.showCropModal.set(false);
    this.imageChangedEvent.set('');
    this.croppedImageBlob.set(null);
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
  }

  confirmCrop() {
    const blob = this.croppedImageBlob();
    if (blob) {
      // Preview cropped image instantly inside modal using Object URL
      const localUrl = URL.createObjectURL(blob);
      this.tempAvatarId.set(localUrl);

      // Emit cropped blob to parent for upload or processing
      this.onCustomPhotoCropped.emit(blob);
    }
    this.cancelCrop();
  }

  cancelSelection() {
    this.onClose.emit();
  }

  confirmSelection() {
    this.onSave.emit({
      avatarId: this.tempAvatarId(),
      avatarColor: this.tempAvatarColor(),
      avatarFrame: this.tempAvatarFrame()
    });
  }
}
