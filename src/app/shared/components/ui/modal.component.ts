import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-[var(--backdrop-bg)] backdrop-blur-md z-[200] flex flex-col items-center justify-center p-4" (click)="handleBackdropClick($event)">
        <div class="bg-[var(--modal-bg)] backdrop-blur-2xl border-2 border-primary/50 rounded-3xl p-6 w-full shadow-[0_0_30px_rgb(var(--color-primary)/0.3)] flex flex-col items-center animate-in fade-in zoom-in-95 duration-200" 
             [ngClass]="maxWidthClass"
             (click)="$event.stopPropagation()">
          
          <!-- ICON WRAPPER -->
          @if (icon) {
            <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shrink-0" 
                 [ngClass]="{
                   'bg-secondary/20 text-secondary border border-secondary/50': icon === 'info',
                   'bg-red-500/20 text-red-500 border border-red-500/50': icon === 'error',
                   'bg-green-500/20 text-green-500 border border-green-500/50': icon === 'success',
                   'bg-amber-500/20 text-amber-500 border border-amber-500/50': icon === 'warning'
                 }">
              @if (icon === 'info') {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
              } @else if (icon === 'error' || icon === 'warning') {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              } @else if (icon === 'success') {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              }
            </div>
          } @else {
            <ng-content select="[modal-icon]"></ng-content>
          }

          <!-- TITLE -->
          @if (title) {
            <h3 class="text-2xl font-black text-textPrimary text-center mb-2 shrink-0">{{ title }}</h3>
          }

          <!-- BODY -->
          <div class="w-full text-center overflow-y-auto custom-scrollbar" [ngClass]="bodyClass">
            <ng-content></ng-content>
          </div>

          <!-- FOOTER -->
          <div class="w-full flex flex-col gap-3 shrink-0" [ngClass]="{'mt-6': hasFooter}">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
          
        </div>
      </div>
    }
  `
})
export class ModalComponent implements OnDestroy {
  @Input() set isOpen(value: boolean) {
    this._isOpen = value;
    if (typeof document !== 'undefined') {
      if (value) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
  get isOpen() {
    return this._isOpen;
  }
  private _isOpen = false;

  @Input() title = '';
  @Input() icon: 'info' | 'error' | 'success' | 'warning' | null = null;
  @Input() preventCloseOutside = false;
  @Input() maxWidthClass = 'max-w-sm'; // default max-width
  @Input() bodyClass = 'max-h-[60vh]'; // default body class for scrolling
  @Input() hasFooter = true; // allow removing top margin if no footer

  @Output() onClose = new EventEmitter<void>();

  handleBackdropClick(event: MouseEvent) {
    if (!this.preventCloseOutside) {
      this.onClose.emit();
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
