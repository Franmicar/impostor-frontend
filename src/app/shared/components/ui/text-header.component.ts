import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgb(var(--color-primary)/0.4)] text-center tracking-wider">
      <ng-content></ng-content>
    </h2>
  `
})
export class TextHeaderComponent {
}
