import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-primary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block flex-1' },
  imports: [CommonModule],
  template: `
    <button 
      (click)="onClick.emit($event)"
      [disabled]="disabled() || isLoading()"
      [type]="type()"
      [ngClass]="{
        'py-3 px-3 text-lg rounded-2xl w-full': size() === 'large',
        'py-1.5 px-3 text-[0.65rem] rounded-xl': size() === 'small'
      }"
      class="relative group overflow-hidden bg-gradient-to-r from-primary to-secondary text-white font-bold uppercase shadow-[0_0_20px_rgb(var(--color-primary)/0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
      <div class="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors pointer-events-none"></div>
      
      @if (isLoading()) {
        <svg class="animate-spin h-5 w-5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }

      <span class="relative z-10 drop-shadow-md tracking-wider">
        <ng-content></ng-content>
      </span>
    </button>
  `
})
export class ButtonPrimaryComponent {
  disabled = input(false);
  isLoading = input(false);
  type = input<'button' | 'submit'>('button');
  size = input<'small' | 'large'>('large');
  onClick = output<MouseEvent>();
}

