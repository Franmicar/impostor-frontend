import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-setup-modes',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="h-full flex flex-col bg-transparent text-white p-6">
      <header class="flex items-center justify-between mb-8 pt-4 shrink-0">
        <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center rounded-full bg-glass border border-glass-border backdrop-blur-md text-slate-300 hover:text-white shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors cursor-pointer">
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
            [class.border-primary]="localMode?.id === mode.id"
            [class.shadow-[0_0_20px_rgba(242,13,185,0.4)]]="localMode?.id === mode.id"
            [class.border-glass-border]="localMode?.id !== mode.id">
            
            <!-- Checkmark icon for selected -->
            @if (localMode?.id === mode.id) {
              <div class="absolute top-2 right-2 z-20 text-primary bg-black/40 backdrop-blur border border-primary rounded-full p-0.5 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                </svg>
              </div>
            }
            
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
      
      <!-- FIXED FOOTER -->
      <footer class="fixed bottom-0 left-0 right-0 p-6 bg-slate-900/80 backdrop-blur-md border-t border-slate-700/50 z-50">
        <button 
          (click)="save()"
          class="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold py-4 text-xl shadow-[0_0_30px_rgba(242,13,185,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2">
          <div class="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
          <span class="relative z-10 drop-shadow-md tracking-wider">{{ 'SETUP.SAVE' | translate }}</span>
        </button>
      </footer>

    </div>
  `,
  styles: ``,
})
export class SetupModes implements OnInit {
  @Input() currentMode!: { id: string; name: string };
  @Output() onBack = new EventEmitter<void>();
  @Output() onChange = new EventEmitter<{ id: string; name: string }>();

  localMode: { id: string; name: string } | null = null;

  ngOnInit() {
    this.localMode = this.currentMode;
  }

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
    this.localMode = { id: mode.id, name: mode.name };
  }

  save() {
    if (this.localMode) {
      this.onChange.emit(this.localMode);
    }
    this.onBack.emit();
  }

  goBack() {
    this.localMode = this.currentMode; // Discard changes
    this.onBack.emit();
  }
}
