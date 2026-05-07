import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-primary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <button 
      (click)="onClick.emit($event)"
      [disabled]="disabled()"
      [type]="type()"
      [ngClass]="{
        'py-3 px-6 text-lg rounded-2xl w-full': size() === 'large',
        'py-1.5 px-3 text-[0.65rem] rounded-xl': size() === 'small'
      }"
      class="relative group overflow-hidden bg-gradient-to-r from-primary to-secondary text-white font-bold uppercase shadow-[0_0_20px_rgb(var(--color-primary)/0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
      <div class="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
      <span class="relative z-10 drop-shadow-md tracking-wider">
        <ng-content></ng-content>
      </span>
    </button>
  `
})
export class ButtonPrimaryComponent {
  disabled = input(false);
  type = input<'button' | 'submit'>('button');
  size = input<'small' | 'large'>('large');
  onClick = output<MouseEvent>();
}
