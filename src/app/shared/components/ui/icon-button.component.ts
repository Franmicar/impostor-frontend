import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <button 
      (click)="onClick.emit($event)"
      [disabled]="disabled()"
      class="w-10 h-10 rounded-full bg-glass border border-glass-border text-secondary flex items-center justify-center shadow-[0_0_15px_rgb(var(--color-primary)/0.4)] hover:bg-white/10 transition-colors pointer-events-auto shrink-0 active:scale-95 disabled:opacity-50">
      <ng-content></ng-content>
    </button>
  `
})
export class IconButtonComponent {
  disabled = input(false);
  onClick = output<MouseEvent>();
}
