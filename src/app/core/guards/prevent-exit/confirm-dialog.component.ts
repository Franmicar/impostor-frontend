import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../services/confirm/confirm.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        class="w-full max-w-sm bg-glass backdrop-blur-xl rounded-3xl p-6 border border-glass-border shadow-[0_0_30px_rgba(242,13,185,0.15)] flex flex-col items-center animate-in zoom-in-95 duration-200">
        
        <!-- Warning Icon -->
        <div class="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8 text-rose-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <!-- Text -->
        <h2 class="text-2xl font-black text-white text-center mb-2 tracking-wide">{{ 'CONFIRM.TITLE' | translate }}</h2>
        <p class="text-slate-300 text-center mb-8 font-medium">{{ 'CONFIRM.MESSAGE' | translate }}</p>

        <!-- Actions -->
        <div class="w-full flex gap-4">
          <button 
            (click)="close(false)"
            class="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-bold transition-all active:scale-95 uppercase tracking-widest cursor-pointer">
            {{ 'CONFIRM.CANCEL' | translate }}
          </button>
          <button 
            (click)="close(true)"
            class="flex-1 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50 rounded-xl font-bold shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all active:scale-95 uppercase tracking-widest cursor-pointer">
            {{ 'CONFIRM.EXIT' | translate }}
          </button>
        </div>
        
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmService);

  close(result: boolean) {
    this.confirmService.respond(result);
  }
}
