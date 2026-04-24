import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  label: string; 
  value: any;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full min-w-[133px] shrink-0">
      <div 
        (click)="isOpen.set(!isOpen())"
        class="bg-glass rounded-2xl border border-primary shadow-[0_0_15px_rgb(var(--color-primary)/0.4)] px-3 py-3 flex items-center justify-between hover:bg-white/20 transition-all cursor-pointer">
        <span class="text-xs sm:text-sm font-medium text-textPrimary select-none">
          {{ selectedLabel() }}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-textMuted transition-transform" [class.rotate-180]="isOpen()">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      
      @if (isOpen()) {
        <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div>
        <div class="absolute right-0 top-full mt-1 w-full z-50 bg-glass backdrop-blur-xl rounded-2xl border border-primary shadow-[0_0_20px_rgb(var(--color-primary)/0.4)] p-2 flex flex-col gap-1 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
          @for (option of options; track option.value) {
            <div 
              (click)="selectOption(option.value)" 
              class="px-4 py-3 rounded-xl hover:bg-white/20 transition-colors text-textPrimary text-sm font-medium cursor-pointer whitespace-nowrap"
              [class.bg-white_10]="option.value === value">
              {{ option.label }}
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background-color: transparent;
      margin: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(var(--color-primary), 0.3);
      border-radius: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(var(--color-primary), 0.6);
    }
  `]
})
export class SelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() value: any;
  @Output() valueChange = new EventEmitter<any>();

  isOpen = signal<boolean>(false);

  selectedLabel(): string {
    const option = this.options.find(o => o.value === this.value);
    return option ? option.label : '';
  }

  selectOption(val: any) {
    this.valueChange.emit(val);
    this.isOpen.set(false);
  }
}
