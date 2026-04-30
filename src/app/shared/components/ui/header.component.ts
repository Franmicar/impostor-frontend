import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from './icon-button.component';
import { TextHeaderComponent } from './text-header.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconButtonComponent, TextHeaderComponent],
  template: `
    <header class="flex items-center justify-between py-6 px-4 relative z-10 w-full">
      <!-- Back Button Space -->
      <div class="w-10 flex shrink-0 justify-start">
        @if (showBack) {
          <app-icon-button (onClick)="onBack.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </app-icon-button>
        }
      </div>

      <!-- Center Title -->
      <app-text-header class="flex-1 text-center whitespace-nowrap overflow-hidden text-ellipsis px-2">{{ title }}</app-text-header>

      <!-- Extra Right Content -->
      <div class="w-10 flex shrink-0 justify-end">
        <ng-content select="[header-extra]"></ng-content>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() showBack: boolean = false;
  @Output() onBack = new EventEmitter<void>();
}
