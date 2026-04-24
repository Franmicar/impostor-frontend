import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../services/confirm/confirm.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ModalComponent } from '../../../shared/components/ui/modal.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="true"
      [title]="'CONFIRM.TITLE' | translate"
      icon="error"
      (onClose)="close(false)">
      
      <p class="text-textMuted text-center mb-8 font-medium w-full">{{ 'CONFIRM.MESSAGE' | translate }}</p>

      <div modal-footer class="w-full flex gap-3">
        <button 
          (click)="close(false)"
          class="flex-1 py-4 bg-glass hover:bg-white/10 border border-glass-border text-textMuted rounded-xl font-bold shadow-[0_0_15px_rgb(var(--color-secondary)/0.4)] transition-all active:scale-95 uppercase tracking-widest cursor-pointer text-sm">
          {{ 'CONFIRM.CANCEL' | translate }}
        </button>
        <button 
          (click)="close(true)"
          class="relative group overflow-hidden flex-1 py-4 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-95 transition-all text-center cursor-pointer uppercase tracking-widest flex items-center justify-center text-sm">
          <div class="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors pointer-events-none"></div>
          <span class="relative z-10 drop-shadow-md pointer-events-none">
            {{ 'CONFIRM.EXIT' | translate }}
          </span>
        </button>
      </div>
    </app-modal>
  `
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmService);

  close(result: boolean) {
    this.confirmService.respond(result);
  }
}
