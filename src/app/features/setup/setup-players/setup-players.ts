import { ChangeDetectionStrategy, Component, input, output, inject, signal, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { PlayerConfig } from '../setup.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { BillingService } from '../../../core/services/billing.service';
import { CloudPresetsService, Preset } from '../../../core/services/cloud-presets/cloud-presets.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AvatarPickerModalComponent } from '../../../shared/components/ui/avatar-picker-modal.component';
import { AvatarComponent } from '../../../shared/components/ui/avatar.component';


import { IconButtonComponent } from '../../../shared/components/ui/icon-button.component';
import { ButtonPrimaryComponent } from '../../../shared/components/ui/button-primary.component';
import { ButtonSecondaryComponent } from '../../../shared/components/ui/button-secondary.component';
import { ModalComponent } from '../../../shared/components/ui/modal.component';
import { HeaderComponent } from '../../../shared/components/ui/header.component';
import { FooterComponent } from '../../../shared/components/ui/footer.component';
import { InputComponent } from '../../../shared/components/ui/input.component';

@Component({
 selector: 'app-setup-players',
 standalone: true,
 changeDetection: ChangeDetectionStrategy.OnPush,
 imports: [CommonModule, FormsModule, DragDropModule, TranslateModule, IconButtonComponent, ButtonPrimaryComponent, ButtonSecondaryComponent, ModalComponent, HeaderComponent, FooterComponent, InputComponent, AvatarPickerModalComponent, AvatarComponent],
 template: `
  <div class="min-h-dvh flex flex-col bg-transparent text-white">
   
   <!-- HEADER -->
   <app-header [showBack]="true" [title]="'SETUP.PLAYERS' | translate" (onBack)="goBack()"></app-header>
   
   <div class="flex-1 px-6 flex flex-col">
   @if (authService.userSignal()) {
    <div class="flex justify-start w-full mb-6">
     <app-button-secondary (onClick)="openCloudSaveModal()">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><path d="M17 21v-8H7v8"></path><path d="M7 3v5h8"></path></svg>
      {{ selectedPresetId() ? ('SETUP_PLAYERS.EDIT_GROUP_BTN' | translate) : ('SETUP_PLAYERS.SAVE_GROUP_BTN' | translate) }}
     </app-button-secondary>
    </div>
   }

   <!-- PRESETS NUBE -->
   @if (authService.userSignal() && cloudPresets().length > 0) {
    <div class="mb-4 bg-glass border border-glass-border rounded-xl p-3 flex gap-2 overflow-x-auto custom-scrollbar items-center">
     <span class="text-xs font-bold text-textMuted uppercase mr-2 shrink-0">{{ 'SETUP_PLAYERS.GROUPS_LBL' | translate }}</span>
     @for (preset of cloudPresets(); track preset.id) {
      <div 
       class="flex items-center rounded-xl border transition-colors shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
       [ngClass]="selectedPresetId() === preset.id ? 'bg-secondary/20 text-secondary border-secondary/50' : 'bg-white/5 border-white/10 text-textMuted hover:bg-white/10'">
       <button 
        (click)="loadPreset(preset)"
        class="px-4 py-2 text-xs font-semibold whitespace-nowrap outline-none">
        {{ preset.name }}
       </button>
       <button 
        (click)="deleteConfirmModal.set({show: true, presetId: preset.id}); $event.stopPropagation()"
        class="pr-3 pl-1 py-2 text-textMuted hover:text-red-400 transition-colors outline-none"
        title="Eliminar grupo">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
       </button>
      </div>
     }
    </div>
   }

   <!-- Scrollable Area - Added pb-40 to clear the custom double-button footer -->
   <div 
    cdkDropList 
    (cdkDropListDropped)="drop($event)"
    class="flex-1 custom-scrollbar">
    <div 
     class="space-y-3">
     
     @for (player of localPlayers; track player.id; let i = $index) {
      <div 
       cdkDrag 
       class="flex items-center gap-4 bg-glass border-glass-border backdrop-blur-md p-2 pl-4 rounded-xl border shadow-lg hover:bg-white/5 transition-colors">
       
       <!-- DRAG HANDLE -->
       <div cdkDragHandle class="cursor-grab active:cursor-grabbing">
        <app-icon-button class="pointer-events-none">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
         </svg>
        </app-icon-button>
       </div>
       
       <button 
        (click)="openAvatarPicker(player, i)"
        class="w-12 h-12 rounded-full shrink-0 border border-glass-border bg-white/5 hover:border-secondary transition-colors relative group shadow-[0_0_15px_rgba(255,255,255,0.05)] flex items-center justify-center cursor-pointer">
        
        <app-avatar
          [avatarId]="player.photoUrl || themeService.resolveAsset('shared.default_avatar')"
          [avatarColor]="player.avatarColor || '#06b6d4'"
          [avatarFrame]="player.avatarFrame"
          [nickname]="player.name || '?'"
          avatarSize="w-12 h-12"></app-avatar>

        <!-- Overlay Hover para subir nueva foto/seleccionar avatar -->
        <div class="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-full z-20">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
        </div>
       </button>
       
       <!-- INPUT FIELD -->
       <app-input 
        [(ngModel)]="player.name"
        (ngModelChange)="onPlayerEdited()"
        [maxlength]="15"
        focusBorder="secondary"
        [placeholder]="'SETUP_PLAYERS.P_NAME' | translate" />
        
       <!-- DELETE BUTTON -->
       @if (localPlayers.length > 3) {
        <button 
         (click)="removePlayer(i)"
         class="w-10 h-10 flex items-center justify-center text-textMuted hover:text-primary transition-colors mr-1">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
         </svg>
        </button>
       }

      </div>
     }
    </div>
   </div>
  </div>

   <!-- FOOTER ACCIONES -->
   <app-footer>
    <!-- ADD PLAYER BUTTON -->
     <app-button-secondary (onClick)="addPlayer()">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      {{ 'SETUP_PLAYERS.ADD_PLAYER' | translate }}
     </app-button-secondary>

    <!-- SAVE BUTTON -->
     <app-button-primary (onClick)="save()">
      {{ 'SETUP.SAVE' | translate }}
     </app-button-primary>
   </app-footer>

   <!-- MODAL PARA GUARDAR PRESET CLOUD -->
   <app-modal
     [isOpen]="showCloudSaveModal"
     [title]="'SETUP_PLAYERS.SAVE_GROUP_TITLE' | translate"
     (onClose)="showCloudSaveModal = false">
     
     <div modal-icon class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-secondary/50 text-secondary bg-secondary/20">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-8H7v8"></path><path stroke-linecap="round" stroke-linejoin="round" d="M7 3v5h8"></path></svg>
     </div>
     
     <p class="text-sm text-textMuted mb-4">{{ 'SETUP_PLAYERS.SAVE_GROUP_DESC' | translate }}</p>
     
      <div class="w-full text-left">
       <app-input 
        [(ngModel)]="cloudPresetName"
        [placeholder]="'SETUP_PLAYERS.SAVE_GROUP_PLACEHOLDER' | translate"
        [maxlength]="30"
        focusBorder="primary" />
       <div class="text-right text-xs text-textMuted mt-1 font-medium">
        {{ cloudPresetName.length || 0 }}/30
       </div>
      </div>

      <div modal-footer class="flex gap-3 w-full">
       <app-button-secondary (onClick)="showCloudSaveModal = false" class="flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        {{ 'VOTE.CANCEL' | translate }}
       </app-button-secondary>
       <app-button-primary 
        (onClick)="confirmSaveCloud()"
        [disabled]="!cloudPresetName.trim()"
        class="flex-1">
         {{ 'SETUP.SAVE' | translate }}
       </app-button-primary>
      </div>
    </app-modal>

    <!-- MODAL ALERTAS GENERICO -->
    <app-modal
      [isOpen]="alertModal().show"
      [title]="alertModal().title"
      [icon]="alertModal().isError ? 'error' : 'success'"
      (onClose)="alertModal.set({show: false, title: '', message: '', isError: false})">
      
      <p class="text-base text-textMuted w-full">
       {{ alertModal().message }}
      </p>
      
      <app-button-primary modal-footer
       (onClick)="alertModal.set({show: false, title: '', message: '', isError: false})"
       class="w-full">
       {{ 'COMMON.OK' | translate }}
      </app-button-primary>
    </app-modal>

    <!-- TOAST DE ÉXITO -->
    @if (showSuccessToast()) {
      <div class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-5 py-3 rounded-full border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)] backdrop-blur-md z-50 flex items-center gap-2 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4 text-green-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <span class="text-xs font-semibold tracking-wide">{{ toastMessage() }}</span>
      </div>
    }

    <!-- MODAL CONFIRM DELETE -->
    <app-modal
      [isOpen]="deleteConfirmModal().show"
      [title]="'CONFIRM_DELETE_PRESET.TITLE' | translate"
      icon="error"
      (onClose)="deleteConfirmModal.set({show: false, presetId: ''})">
      
      <p class="text-base text-textMuted mb-2 w-full">
       {{ 'CONFIRM_DELETE_PRESET.MESSAGE' | translate }}
      </p>
      
      <div modal-footer class="flex gap-3 w-full">
       <app-button-secondary 
        (onClick)="deleteConfirmModal.set({show: false, presetId: ''})"
        class="flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        {{ 'CONFIRM_DELETE_PRESET.CANCEL' | translate }}
       </app-button-secondary>
       <button 
        (click)="executeDeletePreset()"
        class="flex-1 py-4 rounded-xl bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-colors uppercase tracking-widest text-sm">
        {{ 'CONFIRM_DELETE_PRESET.CONFIRM' | translate }}
       </button>
      </div>
    </app-modal>

     <!-- MODAL SELECTOR DE AVATAR -->
     <app-avatar-picker-modal
       [isOpen]="showAvatarPickerModal"
       [title]="'SETUP_PLAYERS.SELECT_AVATAR' | translate"
       [avatarId]="currentPlayerForAvatar?.photoUrl || ''"
       [avatarFrame]="currentPlayerForAvatar?.avatarFrame || ''"
       [avatarColor]="currentPlayerForAvatar?.avatarColor || '#06b6d4'"
       [nickname]="currentPlayerForAvatar?.name || ''"
       (onClose)="showAvatarPickerModal = false"
       (onCustomPhotoCropped)="onLocalPlayerPhotoCropped($event)"
       (onSave)="saveLocalPlayerAvatar($event)">
     </app-avatar-picker-modal>
   </div>
 `,
 styles: [`
  /* Custom Scrollbar to match duration select */
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
  
  .cdk-drag-preview {
   box-sizing: border-box;
   border-radius: 0.75rem; /* xl */
   box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
         0 8px 10px 1px rgba(0, 0, 0, 0.14),
         0 3px 14px 2px rgba(0, 0, 0, 0.12);
   opacity: 0.9;
  }
  .cdk-drag-placeholder {
   opacity: 0.3;
  }
  .cdk-drag-animating {
   transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
  }
  .cdk-drop-list-dragging .cdk-drag {
   transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
  }
 `]
})
export class SetupPlayers {
 private initialPlayersBackup: PlayerConfig[] = [];

 currentPlayers = input<PlayerConfig[]>([]);
 presetId = input<string | null>(null);

 onBack = output<void>();
 onChange = output<PlayerConfig[]>();
 presetIdChange = output<string | null>();
 presetNameChange = output<string | null>();

 authService = inject(AuthService);
 presetsService = inject(CloudPresetsService);
 cdr = inject(ChangeDetectorRef);
 translate = inject(TranslateService);
 billing = inject(BillingService);
 themeService = inject(ThemeService);

 localPlayers: PlayerConfig[] = [];
 cloudPresets = signal<Preset[]>([]);

 showCloudSaveModal = false;
 cloudPresetName = '';
 selectedPresetId = signal<string | null>(null);

 // Alert Modals
 alertModal = signal<{ show: boolean, title: string, message: string, isError: boolean }>({
  show: false, title: '', message: '', isError: false
 });
 showSuccessToast = signal(false);
 toastMessage = signal('');

 deleteConfirmModal = signal<{ show: boolean, presetId: string }>({ show: false, presetId: '' });

  // Avatar Picker Modals
  showAvatarPickerModal = false;
  currentPlayerForAvatar: PlayerConfig | null = null;
  currentPlayerIndexForAvatar: number | null = null;

 showAlert(titleKey: string, messageKey: string, isError: boolean = false, params?: any) {
  const title = this.translate.instant(titleKey);
  const message = this.translate.instant(messageKey, params);
  this.alertModal.set({ show: true, title, message, isError });
 }

  openAvatarPicker(player: PlayerConfig, index: number) {
   this.currentPlayerForAvatar = player;
   this.currentPlayerIndexForAvatar = index;
   this.showAvatarPickerModal = true;
  }

  onLocalPlayerPhotoCropped(blob: Blob) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (this.currentPlayerForAvatar) {
        this.currentPlayerForAvatar.photoUrl = e.target.result;
        this.onPlayerEdited();
        this.cdr.detectChanges();
      }
    };
    reader.readAsDataURL(blob);
  }

  saveLocalPlayerAvatar(selection: { avatarId: string; avatarColor: string; avatarFrame: string }) {
    if (this.currentPlayerForAvatar) {
      this.currentPlayerForAvatar.photoUrl = selection.avatarId;
      this.currentPlayerForAvatar.avatarColor = selection.avatarColor;
      this.currentPlayerForAvatar.avatarFrame = selection.avatarFrame;
      this.onPlayerEdited();
      this.cdr.detectChanges();
    }
    this.showAvatarPickerModal = false;
  }

 constructor() {
  effect(() => {
   const user = this.authService.userSignal();
   if (user) {
    this.presetsService.getUserPresets().then(p => {
     this.cloudPresets.set(p);
    }).catch(e => {
     console.error("Error cargando presets", e);
     this.alertModal.set({ show: true, title: this.translate.instant('ALERTS.API_ERROR'), message: e.message || this.translate.instant('ALERTS.DB_ACCESS_FAIL'), isError: true });
    });
   } else {
    this.cloudPresets.set([]); // limpiar si cierra sesión
   }
  });

  effect(() => {
    const players = this.currentPlayers();
    if (players && players.length > 0) {
      this.initialPlayersBackup = JSON.parse(JSON.stringify(players));
      this.localPlayers = JSON.parse(JSON.stringify(players));
    }
  }, { allowSignalWrites: true });

  effect(() => {
    this.selectedPresetId.set(this.presetId());
  }, { allowSignalWrites: true });
 }

 drop(event: CdkDragDrop<PlayerConfig[]>) {
  moveItemInArray(this.localPlayers, event.previousIndex, event.currentIndex);
 }

 async executeDeletePreset() {
  const presetId = this.deleteConfirmModal().presetId;
  if (!presetId) return;

  try {
   await this.presetsService.deletePreset(presetId);
   const p = await this.presetsService.getUserPresets();
   this.cloudPresets.set(p);
   if (this.selectedPresetId() === presetId) {
    this.selectedPresetId.set(null);
   }
  } catch (e) {
   console.error(e);
   this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.SAVE_ERROR', true);
  }

  this.deleteConfirmModal.set({ show: false, presetId: '' });
 }

 openCloudSaveModal() {
  // Check for duplicates before opening modal
  const names = this.localPlayers.map(p => p.name.trim());
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
   this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.DUPLICATE_NAME', true);
   return;
  }

  if (this.selectedPresetId()) { this.executeEditPreset(); } else { this.cloudPresetName = ""; this.showCloudSaveModal = true; }
 }

 
 async executeEditPreset() {
  const presetId = this.selectedPresetId();
  const existingPreset = this.cloudPresets().find(p => p.id === presetId);
  const presetName = existingPreset ? existingPreset.name : this.translate.instant('SETUP_PLAYERS.EDITED_GROUP');
  
  const cleanPlayers = JSON.parse(JSON.stringify(this.localPlayers));
  try {
   await this.presetsService.savePreset(presetName, cleanPlayers, presetId || undefined);
   const p = await this.presetsService.getUserPresets();
   this.cloudPresets.set(p);
   this.toastMessage.set(this.translate.instant('ALERTS.SAVE_SUCCESS', { name: presetName }));
   this.showSuccessToast.set(true);
   setTimeout(() => this.showSuccessToast.set(false), 3000);
  } catch(error: any) {
   console.error("Firebase update error: ", error);
   this.alertModal.set({ show: true, title: this.translate.instant('ALERTS.FATAL_DB_ERROR'), message: error?.message || this.translate.instant('ALERTS.UPDATE_ERROR'), isError: true });
  }
 }

 async confirmSaveCloud() {
  if (this.cloudPresetName.trim()) {
   const presetName = this.cloudPresetName.trim();
   const cleanPlayers = JSON.parse(JSON.stringify(this.localPlayers));
   try {
    await this.presetsService.savePreset(presetName, cleanPlayers);

    const p = await this.presetsService.getUserPresets();
    this.cloudPresets.set(p);

    const newPreset = p.find(preset => preset.name === presetName);
    if (newPreset) {
     this.selectedPresetId.set(newPreset.id);
    }

    this.toastMessage.set(this.translate.instant('ALERTS.SAVE_SUCCESS', { name: presetName }));
    this.showSuccessToast.set(true);
    setTimeout(() => this.showSuccessToast.set(false), 3000);
   } catch (error: any) {
    console.error("Firebase save error: ", error);
    if (error?.message === 'LIMIT_REACHED') {
     this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.LIMIT_REACHED', true);
    } else {
     // Mostramos el mensaje exacto para saber por qué falla en vez de traducción
     this.alertModal.set({ show: true, title: this.translate.instant('ALERTS.FATAL_DB_ERROR'), message: error?.message || this.translate.instant('ALERTS.SAVE_ERROR_DB'), isError: true });
    }
   }
   this.showCloudSaveModal = false;
  }
 }

 loadPreset(preset: Preset) {
  if (this.selectedPresetId() === preset.id) {
   this.selectedPresetId.set(null);
   this.localPlayers = [
    { id: '1', name: this.translate.instant('SETUP_PLAYERS.PLAYER_N', { n: 1 }) },
    { id: '2', name: this.translate.instant('SETUP_PLAYERS.PLAYER_N', { n: 2 }) },
    { id: '3', name: this.translate.instant('SETUP_PLAYERS.PLAYER_N', { n: 3 }) }
   ];
   return;
  }
  this.localPlayers = JSON.parse(JSON.stringify(preset.players));
  this.selectedPresetId.set(preset.id);
 }

 onPlayerEdited() {}

 addPlayer() {
  const nextId = new Date().getTime().toString();
  this.localPlayers.push({ id: nextId, name: '' });
  this.onPlayerEdited();
 }

 removePlayer(index: number) {
  if (this.localPlayers.length > 3) {
   this.localPlayers.splice(index, 1);
   this.onPlayerEdited();
  }
 }

 goBack() {
  this.localPlayers = JSON.parse(JSON.stringify(this.initialPlayersBackup));
  this.onBack.emit();
 }

 save() {
  const validatedPlayers = this.localPlayers.map((p, i) => ({
   id: p.id,
   name: p.name.trim() || this.translate.instant('SETUP_PLAYERS.PLAYER_N', { n: i + 1 }),
   photoUrl: p.photoUrl,
   avatarColor: p.avatarColor,
   avatarFrame: p.avatarFrame
  }));

  this.onChange.emit(validatedPlayers);
  this.presetIdChange.emit(this.selectedPresetId());
  const selectedPreset = this.cloudPresets().find(p => p.id === this.selectedPresetId());
  this.presetNameChange.emit(selectedPreset ? selectedPreset.name : null);
  this.onBack.emit();
 }
}
