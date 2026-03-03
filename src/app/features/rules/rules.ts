import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-rules',
    standalone: true,
    imports: [TranslateModule],
    template: `
    <div class="flex flex-col min-h-screen bg-transparent text-slate-50 p-6 overflow-y-auto">
      <header class="flex items-center justify-between mb-8 pt-4 shrink-0">
        <button (click)="goBack()" class="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full bg-glass border border-glass-border backdrop-blur-md text-slate-300 hover:text-white transition-colors active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgba(242,13,185,0.4)] flex-1 text-center">{{ 'RULES.TITLE' | translate }}</h2>
        <div class="w-10 h-10 invisible shrink-0"></div> <!-- Spacer -->
      </header>

      <div class="w-full max-w-lg mx-auto space-y-6 pb-12">
        <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
            <h3 class="text-xl font-bold text-primary drop-shadow-sm mb-3">{{ 'RULES.HOW_TO_PLAY' | translate }}</h3>
            <p class="text-slate-300 text-sm leading-relaxed mb-3">
              {{ 'RULES.H2P_P1' | translate }}
            </p>
            <p class="text-slate-300 text-sm leading-relaxed">
              {{ 'RULES.H2P_P2' | translate }}
            </p>
        </section>

        <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
            <h3 class="text-xl font-bold text-secondary drop-shadow-sm mb-3">{{ 'RULES.ROLES' | translate }}</h3>
            <ul class="space-y-4">
                <li class="flex items-start gap-3">
                    <span class="text-2xl mt-0.5">👤</span>
                    <div>
                        <strong class="text-white block">{{ 'RULES.CIVIL' | translate }}</strong>
                        <span class="text-sm text-slate-400">{{ 'RULES.CIVIL_DESC' | translate }}</span>
                    </div>
                </li>
                <li class="flex items-start gap-3">
                    <span class="text-2xl mt-0.5">👽</span>
                    <div>
                        <strong class="text-primary block">{{ 'RULES.IMPOSTOR' | translate }}</strong>
                        <span class="text-sm text-slate-400">{{ 'RULES.IMPOSTOR_DESC' | translate }}</span>
                    </div>
                </li>
                <li class="flex items-start gap-3">
                    <span class="text-2xl mt-0.5">🕵️‍♂️</span>
                    <div>
                        <strong class="text-indigo-400 block">{{ 'RULES.DETECTIVE' | translate }}</strong>
                        <span class="text-sm text-slate-400">{{ 'RULES.DETECTIVE_DESC' | translate }}</span>
                    </div>
                </li>
            </ul>
        </section>

        <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
            <h3 class="text-xl font-bold text-fuchsia-400 drop-shadow-sm mb-3">{{ 'RULES.GAME_MODES' | translate }}</h3>
            <div class="space-y-3">
                <div class="p-3 bg-black/30 backdrop-blur rounded-xl border border-glass-border">
                    <strong class="text-white block mb-1">🎭 {{ 'RULES.CLASSIC' | translate }}</strong>
                    <span class="text-sm text-slate-400 block">{{ 'RULES.CLASSIC_DESC' | translate }}</span>
                </div>
                <div class="p-3 bg-black/30 backdrop-blur rounded-xl border border-glass-border">
                    <strong class="text-white block mb-1">⏱️ {{ 'RULES.FAST' | translate }}</strong>
                    <span class="text-sm text-slate-400 block">{{ 'RULES.FAST_DESC' | translate }}</span>
                </div>
                <div class="p-3 bg-black/30 backdrop-blur rounded-xl border border-glass-border">
                    <strong class="text-white block mb-1">🕵️‍♂️ {{ 'RULES.DETECTIVE_MODE' | translate }}</strong>
                    <span class="text-sm text-slate-400 block">{{ 'RULES.DETECTIVE_MODE_DESC' | translate }}</span>
                </div>
                <div class="p-3 bg-black/30 backdrop-blur rounded-xl border border-glass-border">
                    <strong class="text-white block mb-1">🥷 {{ 'RULES.INFILTRATOR' | translate }}</strong>
                    <span class="text-sm text-slate-400 block">{{ 'RULES.INFILTRATOR_DESC' | translate }}</span>
                </div>
                <div class="p-3 bg-black/30 backdrop-blur rounded-xl border border-glass-border">
                    <strong class="text-white block mb-1">🤝 {{ 'RULES.TEAM' | translate }}</strong>
                    <span class="text-sm text-slate-400 block">{{ 'RULES.TEAM_DESC' | translate }}</span>
                </div>
                <div class="p-3 bg-black/30 backdrop-blur rounded-xl border border-glass-border">
                    <strong class="text-white block mb-1">🌪️ {{ 'RULES.CHAOS' | translate }}</strong>
                    <span class="text-sm text-slate-400 block">{{ 'RULES.CHAOS_DESC' | translate }}</span>
                </div>
            </div>
        </section>
      </div>

    </div>
  `
})
export class Rules {
    private router = inject(Router);

    goBack() {
        this.router.navigate(['/']);
    }
}
