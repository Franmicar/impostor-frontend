import { Component, EventEmitter, Input, Output, inject, signal, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { PlayerConfig } from '../setup.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CloudPresetsService, Preset } from '../../../core/services/cloud-presets/cloud-presets.service';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-setup-players',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TranslateModule, ImageCropperComponent],
  template: `
    <div class="h-full flex flex-col bg-transparent text-white p-6">
      
      <!-- HEADER -->
      <header class="flex items-center gap-4 mb-6 relative z-10">
        <button 
          (click)="goBack()"
          class="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center transition-all active:scale-90">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 text-white drop-shadow-md">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <h1 class="text-3xl font-black text-white px-2 py-1 tracking-wider uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] flex-1" style="font-size: 1.5rem; font-weight: 700;">
            {{ 'SETUP.PLAYERS' | translate }}
        </h1>

        @if (authService.userSignal()) {
          <button 
              (click)="openCloudSaveModal()"
              class="h-10 px-3 flex items-center gap-1.5 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 rounded-lg text-xs font-bold uppercase tracking-wide transition-all active:scale-95 shadow-[0_0_10px_rgba(242,13,185,0.2)] shrink-0" title="Guardar Mesa">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><path d="M17 21v-8H7v8"></path><path d="M7 3v5h8"></path></svg>
              <span>Guardar grupo</span>
          </button>
        } @else {
          <div class="h-10 px-3 shrink-0 invisible"></div>
        }
      </header>

      <!-- PRESETS NUBE -->
      @if (authService.userSignal() && cloudPresets().length > 0) {
        <div class="mb-4 bg-black/30 border border-glass-border rounded-xl p-3 flex gap-2 overflow-x-auto custom-scrollbar items-center">
          <span class="text-xs font-bold text-slate-400 uppercase mr-2 shrink-0">Grupos:</span>
          @for (preset of cloudPresets(); track preset.id) {
            <div 
              class="flex items-center rounded-xl border transition-colors shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
              [ngClass]="selectedPresetId() === preset.id ? 'bg-secondary/20 text-secondary border-secondary/50' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'">
              <button 
                (click)="loadPreset(preset)"
                class="px-4 py-2 text-xs font-semibold whitespace-nowrap outline-none">
                {{ preset.name }}
              </button>
              <button 
                (click)="deleteConfirmModal.set({show: true, presetId: preset.id}); $event.stopPropagation()"
                class="pr-3 pl-1 py-2 text-slate-400 hover:text-red-400 transition-colors outline-none"
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
        class="flex-1 overflow-y-auto pb-44 px-2 custom-scrollbar">
        <div 
          class="space-y-3">
          
          @for (player of localPlayers; track player.id; let i = $index) {
            <div 
              cdkDrag 
              class="flex items-center gap-4 bg-glass border-glass-border backdrop-blur-md p-2 pl-4 rounded-xl border shadow-lg hover:bg-white/5 transition-colors">
              
              <!-- DRAG HANDLE -->
              <div cdkDragHandle class="cursor-grab text-slate-400 hover:text-white active:cursor-grabbing p-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
              </div>
              
              <!-- AVATAR UPLOAD -->
              <input type="file" [id]="'file-upload-' + i" accept="image/*" class="hidden" (change)="onFileSelected($event, player)" />
              <button 
                (click)="triggerImageUpload(i)"
                class="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-700 hover:border-secondary transition-colors relative group shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                @if (player.photoUrl) {
                  <img [src]="player.photoUrl" class="w-full h-full object-cover" />
                } @else {
                  <div class="w-full h-full bg-slate-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-slate-400">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                }
                <!-- Overlay Hover para subir nueva foto -->
                <div class="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
                </div>
              </button>
              
              <!-- INPUT FIELD -->
              <input 
                type="text" 
                [(ngModel)]="player.name"
                class="flex-1 bg-black/20 outline-none p-3 rounded-lg text-slate-100 font-medium border border-transparent focus:border-secondary focus:bg-black/40 transition-all placeholder-slate-500 min-w-0"
                [placeholder]="'SETUP_PLAYERS.P_NAME' | translate" />
                
              <!-- DELETE BUTTON -->
              @if (localPlayers.length > 3) {
                <button 
                  (click)="removePlayer(i)"
                  class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              }

            </div>
          }
        </div>
      </div>

      <!-- FOOTER ACTIONS -->
      <footer class="fixed bottom-0 left-0 right-0 p-6 bg-slate-900/80 backdrop-blur-md border-t border-slate-700/50 z-50 flex flex-col gap-4">
        
        <!-- ADD BUTTON -->
        <button 
            (click)="addPlayer()"
            class="w-full relative py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95">
            <span>{{ 'SETUP_PLAYERS.ADD_PLAYER' | translate }}</span>
        </button>

        <!-- SAVE BUTTON -->
        <button 
          (click)="save()"
          class="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold py-4 text-xl shadow-[0_0_30px_rgba(242,13,185,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2">
          <div class="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
          <span class="relative z-10 drop-shadow-md tracking-wider">{{ 'SETUP.SAVE' | translate }}</span>
        </button>
      </footer>

      <!-- MODAL PARA GUARDAR PRESET CLOUD -->
      @if (showCloudSaveModal) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-glass-border rounded-3xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-primary"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-8H7v8"></path><path stroke-linecap="round" stroke-linejoin="round" d="M7 3v5h8"></path></svg>
              Guardar Grupo
            </h3>
            <p class="text-sm text-slate-400">Dale un nombre a este grupo de amigos para poder cargarlo rápidamente en el futuro (ej: Familia, Trabajo, Los de siempre).</p>
            
            <div>
              <input 
                type="text" 
                [(ngModel)]="cloudPresetName"
                placeholder="Nombre del grupo..."
                maxlength="30"
                class="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary transition-colors"
                 />
              <div class="text-right text-xs text-slate-500 mt-1 font-medium">
                {{ cloudPresetName.length || 0 }}/30
              </div>
            </div>

            <div class="flex gap-3 mt-2">
              <button 
                (click)="showCloudSaveModal = false"
                class="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-white/5 transition-colors">
                {{ 'VOTE.CANCEL' | translate }}
              </button>
              <button 
                (click)="confirmSaveCloud()"
                [disabled]="!cloudPresetName.trim()"
                class="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-[0_0_15px_rgba(242,13,185,0.4)] disabled:opacity-50 disabled:shadow-none hover:bg-primary/90 transition-colors">
                {{ 'SETUP.SAVE' | translate }}
              </button>
            </div>
          </div>
        </div>
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

      <!-- MODAL CONFIRM DELETE -->
      @if (deleteConfirmModal().show) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-glass-border rounded-3xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            
            <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-red-500/20 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            
            <h3 class="text-2xl font-black text-white">
              {{ 'CONFIRM_DELETE_PRESET.TITLE' | translate }}
            </h3>
            
            <p class="text-base text-slate-400 mb-2">
              {{ 'CONFIRM_DELETE_PRESET.MESSAGE' | translate }}
            </p>
            
            <div class="flex gap-3 w-full">
              <button 
                (click)="deleteConfirmModal.set({show: false, presetId: ''})"
                class="flex-1 py-4 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-white/5 transition-colors">
                {{ 'CONFIRM_DELETE_PRESET.CANCEL' | translate }}
              </button>
              <button 
                (click)="executeDeletePreset()"
                class="flex-1 py-4 rounded-xl bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-colors">
                {{ 'CONFIRM_DELETE_PRESET.CONFIRM' | translate }}
              </button>
            </div>
            
          </div>
        </div>
      }

      <!-- MODAL RECORTAR IMAGEN -->
      @if (showCropModal) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-glass-border rounded-3xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            
            <h3 class="text-2xl font-black text-white">
              Recortar Imagen
            </h3>
            
            <div class="w-full h-64 bg-black/50 border border-slate-700 rounded-xl overflow-hidden relative flex items-center justify-center">
              <image-cropper
                [imageChangedEvent]="imageChangedEvent"
                [maintainAspectRatio]="true"
                [aspectRatio]="1 / 1"
                [resizeToWidth]="200"
                format="jpeg"
                (imageCropped)="imageCropped($event)"
                (loadImageFailed)="loadImageFailed()"
                style="max-height: 250px; max-width: 100%; margin: auto;"
              ></image-cropper>
            </div>
            
            <div class="flex gap-3 w-full mt-2">
              <button 
                (click)="cancelCrop()"
                class="flex-1 py-4 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button 
                (click)="confirmCrop()"
                class="flex-1 py-4 rounded-xl bg-primary text-white font-bold shadow-[0_0_15px_rgba(242,13,185,0.4)] hover:bg-primary/90 transition-colors">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      }
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

  @Input() set currentPlayers(players: PlayerConfig[]) {
    // Deep clone to avoid mutating parent until saved
    this.initialPlayersBackup = JSON.parse(JSON.stringify(players));
    this.localPlayers = JSON.parse(JSON.stringify(players));
  }

  @Output() onBack = new EventEmitter<void>();
  @Output() onChange = new EventEmitter<PlayerConfig[]>();

  @Output() presetIdChange = new EventEmitter<string | null>();

  @Input() set presetId(val: string | null) {
    this.selectedPresetId.set(val);
  }

  authService = inject(AuthService);
  presetsService = inject(CloudPresetsService);
  cdr = inject(ChangeDetectorRef);
  translate = inject(TranslateService);

  localPlayers: PlayerConfig[] = [];
  cloudPresets = signal<Preset[]>([]);

  showCloudSaveModal = false;
  cloudPresetName = '';
  selectedPresetId = signal<string | null>(null);

  // Alert Modals
  alertModal = signal<{ show: boolean, title: string, message: string, isError: boolean }>({
    show: false, title: '', message: '', isError: false
  });

  deleteConfirmModal = signal<{ show: boolean, presetId: string }>({ show: false, presetId: '' });

  // Cropper Modals
  showCropModal = false;
  imageChangedEvent: any = '';
  currentPlayerToCrop: PlayerConfig | null = null;
  croppedImageBlob: Blob | null | undefined = null;
  sanitizer = inject(DomSanitizer);

  showAlert(titleKey: string, messageKey: string, isError: boolean = false, params?: any) {
    const title = this.translate.instant(titleKey);
    const message = this.translate.instant(messageKey, params);
    this.alertModal.set({ show: true, title, message, isError });
  }

  constructor() {
    effect(() => {
      const user = this.authService.userSignal();
      if (user) {
        this.presetsService.getUserPresets().then(p => {
          this.cloudPresets.set(p);
        }).catch(e => console.error("Error cargando presets", e));
      } else {
        this.cloudPresets.set([]); // limpiar si cierra sesión
      }
    });
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
        this.presetIdChange.emit(null);
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

    this.cloudPresetName = '';
    this.showCloudSaveModal = true;
  }

  async confirmSaveCloud() {
    if (this.cloudPresetName.trim()) {
      const presetName = this.cloudPresetName.trim();
      const cleanPlayers = JSON.parse(JSON.stringify(this.localPlayers));
      try {
        await this.presetsService.savePreset(presetName, cleanPlayers);

        const p = await this.presetsService.getUserPresets();
        this.cloudPresets.set(p);

        this.showAlert('ALERTS.TITLE_SUCCESS', 'ALERTS.SAVE_SUCCESS', false, { name: presetName });
      } catch (error: any) {
        console.error("Firebase save error: ", error);
        if (error?.message === 'LIMIT_REACHED') {
          this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.LIMIT_REACHED', true);
        } else {
          this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.SAVE_ERROR', true);
        }
      }
      this.showCloudSaveModal = false;
    }
  }

  loadPreset(preset: Preset) {
    this.localPlayers = JSON.parse(JSON.stringify(preset.players));
    this.selectedPresetId.set(preset.id);
    this.presetIdChange.emit(preset.id);
  }

  addPlayer() {
    const nextId = new Date().getTime().toString();
    this.localPlayers.push({ id: nextId, name: '' });
  }

  triggerImageUpload(index: number) {
    const fileInput = document.getElementById(`file-upload-${index}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any, player: PlayerConfig) {
    const file = event.target.files?.[0];
    if (file) {
      // Relax initial validation from 1MB to 5MB since we will crop and scale it down anyway
      if (file.size > 5 * 1024 * 1024) {
        this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.IMAGE_TOO_LARGE', true);
        return;
      }
      this.currentPlayerToCrop = player;
      this.imageChangedEvent = event;
      this.showCropModal = true;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob = event.blob;
  }

  loadImageFailed() {
    this.showAlert('ALERTS.TITLE_ERROR', 'ALERTS.IMAGE_TOO_LARGE', true);
    this.cancelCrop();
  }

  cancelCrop() {
    this.showCropModal = false;
    this.imageChangedEvent = '';
    this.currentPlayerToCrop = null;
    this.croppedImageBlob = null;

    // Reset inputs so the same file could be selected again
    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach(input => (input as HTMLInputElement).value = '');
  }

  confirmCrop() {
    if (this.croppedImageBlob && this.currentPlayerToCrop) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.currentPlayerToCrop) {
          this.currentPlayerToCrop.photoUrl = e.target.result;
        }
        this.cancelCrop();
        this.cdr.detectChanges(); // Ensure the view is updated synchronously after async load
      };
      reader.readAsDataURL(this.croppedImageBlob);
    } else {
      this.cancelCrop();
    }
  }

  removePlayer(index: number) {
    if (this.localPlayers.length > 3) {
      this.localPlayers.splice(index, 1);
    }
  }

  goBack() {
    this.localPlayers = JSON.parse(JSON.stringify(this.initialPlayersBackup));
    this.onBack.emit();
  }

  save() {
    // Clean empty names and assign defaults if needed, ensure photoUrl is preserved
    const validatedPlayers = this.localPlayers.map((p, i) => ({
      id: p.id,
      name: p.name.trim() || `Jugador ${i + 1}`,
      photoUrl: p.photoUrl
    }));

    this.onChange.emit(validatedPlayers);
    this.onBack.emit();
  }
}
