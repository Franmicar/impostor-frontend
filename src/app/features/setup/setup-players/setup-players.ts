import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { PlayerConfig } from '../setup.component';

@Component({
  selector: 'app-setup-players',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TranslateModule],
  template: `
    <div class="h-full flex flex-col bg-transparent text-white p-6">
      
      <!-- HEADER -->
      <header class="flex items-center justify-between mb-8 pt-4">
        <button 
          (click)="goBack()" 
          class="w-10 h-10 flex items-center justify-center bg-glass border border-glass-border backdrop-blur-md hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgba(242,13,185,0.4)] flex-1 text-center">{{ 'SETUP.PLAYERS' | translate }}</h2>
        <div class="w-10 h-10 invisible shrink-0"></div> <!-- Spacer -->
      </header>

      <!-- PLAYERS LIST -->
      <div class="flex-1 overflow-y-auto pb-6">
        <div 
          cdkDropList 
          class="space-y-3" 
          (cdkDropListDropped)="drop($event)">
          
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
              
              <!-- INPUT FIELD -->
              <input 
                type="text" 
                [(ngModel)]="player.name"
                class="flex-1 bg-black/20 outline-none p-3 rounded-lg text-slate-100 font-medium border border-transparent focus:border-secondary focus:bg-black/40 transition-all placeholder-slate-500"
                [placeholder]="'SETUP_PLAYERS.P_NAME' | translate" />
                
              <!-- DELETE BUTTON -->
              @if (localPlayers.length > 3) {
                <button 
                  (click)="removePlayer(i)"
                  class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
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
            class="w-full relative py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95">
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

    </div>
  `,
  styles: [`
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

  localPlayers: PlayerConfig[] = [];

  drop(event: CdkDragDrop<PlayerConfig[]>) {
    moveItemInArray(this.localPlayers, event.previousIndex, event.currentIndex);
  }

  addPlayer() {
    const nextId = new Date().getTime().toString();
    this.localPlayers.push({ id: nextId, name: '' });
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
    // Clean empty names and assign defaults if needed
    const validatedPlayers = this.localPlayers.map((p, i) => ({
      id: p.id,
      name: p.name.trim() || `Jugador ${i + 1}`
    }));

    this.onChange.emit(validatedPlayers);
    this.onBack.emit();
  }
}
