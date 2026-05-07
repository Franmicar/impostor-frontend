import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <span class="inline-block max-w-full font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_20px_rgb(var(--color-primary)/0.4)] tracking-wider whitespace-nowrap">
      <ng-content></ng-content>
    </span>
  `,
  host: {
    'class': 'flex justify-center w-full min-w-0'
  },
  styles: [`
    span {
      /* Escala el texto dinámicamente para que siempre quepa en una línea */
      font-size: clamp(0.9rem, 5vw, 1.5rem);
    }
  `]
})
export class TextHeaderComponent {
}
