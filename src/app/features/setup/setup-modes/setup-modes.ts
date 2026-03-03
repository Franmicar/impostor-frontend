import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-setup-modes',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="h-full flex flex-col bg-transparent text-white p-6">
      <header class="flex items-center justify-between mb-8 pt-4 shrink-0">
        <button (click)="onBack.emit()" class="w-10 h-10 flex items-center justify-center rounded-full bg-glass border border-glass-border backdrop-blur-md text-slate-300 hover:text-white shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgba(242,13,185,0.4)] flex-1 text-center">{{ 'SETUP_MODES.TITLE' | translate }}</h2>
        <div class="w-10 h-10 invisible shrink-0"></div> <!-- Spacer -->
      </header>

      <div class="flex-1 overflow-y-auto pb-20 grid grid-cols-2 gap-4 place-content-start">
        @for (mode of availableModes; track mode.id) {
          <div 
            (click)="selectMode(mode)"
            class="relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 bg-glass backdrop-blur-md flex flex-col h-auto min-h-[16rem]"
            [class.border-cyan-500]="currentMode.id === mode.id"
            [class.shadow-[0_0_20px_rgba(13,242,242,0.4)]]="currentMode.id === mode.id"
            [class.border-glass-border]="currentMode.id !== mode.id">
            
            <!-- Icon/Image based on mode -->
            <div class="flex-1 flex items-center justify-center p-4 bg-white/5">
                <img [src]="'/images/modes/' + mode.id + '.png'" alt="" class="w-32 h-32 object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform">
            </div>
            
            <div class="px-4 pt-4 pb-6 bg-black/20 flex flex-col items-center flex-1 justify-end">
              <h3 class="font-bold text-lg mb-2 text-slate-100">{{ mode.name | translate }}</h3>
              <p class="text-xs text-slate-400 text-center">{{ mode.description | translate }}</p>
            </div>
          </div>
        }
      </div>

    </div>
  `,
  styles: ``,
})
export class SetupModes {
  @Input() currentMode!: { id: string; name: string };
  @Output() onBack = new EventEmitter<void>();
  @Output() onChange = new EventEmitter<{ id: string; name: string }>();

  availableModes = [
    {
      id: 'classic',
      name: 'RULES.CLASSIC',
      description: 'RULES.CLASSIC_DESC',
      emoji: '🎭',
      bgClass: 'bg-gradient-to-br from-slate-700 to-slate-600'
    },
    {
      id: 'fast',
      name: 'RULES.FAST',
      description: 'RULES.FAST_DESC',
      emoji: '⏱️',
      bgClass: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      id: 'detective',
      name: 'RULES.DETECTIVE_MODE',
      description: 'RULES.DETECTIVE_MODE_DESC',
      emoji: '🕵️‍♂️',
      bgClass: 'bg-gradient-to-br from-indigo-900 to-slate-800'
    },
    {
      id: 'infiltrator',
      name: 'RULES.INFILTRATOR',
      description: 'RULES.INFILTRATOR_DESC',
      emoji: '🥷',
      bgClass: 'bg-gradient-to-br from-zinc-800 to-black'
    },
    {
      id: 'team',
      name: 'RULES.TEAM',
      description: 'RULES.TEAM_DESC',
      emoji: '🤝',
      bgClass: 'bg-gradient-to-br from-blue-600 to-indigo-600'
    },
    {
      id: 'chaos',
      name: 'RULES.CHAOS',
      description: 'RULES.CHAOS_DESC',
      emoji: '🌪️',
      bgClass: 'bg-gradient-to-br from-rose-600 to-red-800'
    }
  ];

  selectMode(mode: any) {
    this.onChange.emit({ id: mode.id, name: mode.name });
    // Go back automatically after selection
    setTimeout(() => this.onBack.emit(), 200);
  }
}
