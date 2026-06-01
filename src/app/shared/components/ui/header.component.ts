import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from './icon-button.component';
import { TextHeaderComponent } from './text-header.component';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconButtonComponent, TextHeaderComponent],
  template: `
    <header class="flex items-center justify-between pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-6 px-4 relative z-10 w-full min-h-[80px]">
      <!-- Back Button Space -->
      <div class="flex shrink-0 justify-start relative z-20">
        @if (showBack()) {
          <app-icon-button (onClick)="onBack.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </app-icon-button>
        }
      </div>

      <!-- Center Title -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none w-full max-w-full">
        <app-text-header class="w-full pointer-events-auto">{{ title() }}</app-text-header>
      </div>

      <!-- Extra Right Content -->
      <div class="flex shrink-0 justify-end relative z-20">
        <ng-content select="[header-extra]"></ng-content>
      </div>
    </header>
  `
})
export class HeaderComponent {
  title = input<string>('');
  showBack = input<boolean>(false);
  onBack = output<void>();
}
