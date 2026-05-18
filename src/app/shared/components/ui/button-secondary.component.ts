import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-secondary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block flex-1' },
  imports: [CommonModule],
  template: `
    <button 
      (click)="onClick.emit($event)"
      [disabled]="disabled()"
      [type]="type()"
      class="w-full px-6 bg-glass border border-glass-border hover:bg-white/10 text-textPrimary rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgb(var(--color-secondary)/0.4)] py-3 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap">
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonSecondaryComponent {
  disabled = input(false);
  type = input<'button' | 'submit'>('button');
  onClick = output<MouseEvent>();
}
