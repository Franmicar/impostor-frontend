import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [TranslateModule],
  template: `
  <div class="flex flex-col min-h-dvh bg-transparent text-textPrimary p-6 overflow-y-auto">
   <header class="flex items-center justify-between mb-8 shrink-0">
    <button (click)="goBack()" class="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full bg-glass border border-glass-border backdrop-blur-md text-textMuted hover:text-white transition-colors active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10 cursor-pointer">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
     </svg>
    </button>
    <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgb(var(--color-primary)/0.4)] text-center">{{ 'RULES.TITLE' | translate }}</h2>
    
    <div class="flex items-center justify-end shrink-0 w-10">
     @if (authService.userSignal()) {
      <img [src]="authService.userSignal()?.photoURL || '/images/default-avatar.png'" referrerpolicy="no-referrer" class="w-8 h-8 rounded-full border-2 border-secondary shadow-[0_0_10px_rgb(var(--color-secondary)/0.4)] cursor-pointer" (click)="authService.logout()" title="Cerrar sesión" />
     } @else {
      <button (click)="authService.loginWithGoogle()" class="text-[0.65rem] font-bold text-secondary uppercase bg-white/5 border border-secondary/30 px-2 py-1 rounded-lg hover:bg-secondary/20 transition-colors">
       Login
      </button>
     }
    </div>
   </header>

   <div class="w-full mx-auto space-y-6 pb-12">
    <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
      <h3 class="text-xl font-bold text-primary drop-shadow-sm mb-3">{{ 'RULES.HOW_TO_PLAY' | translate }}</h3>
      <p class="text-textMuted text-sm leading-relaxed mb-3">
       {{ 'RULES.H2P_P1' | translate }}
      </p>
      <p class="text-textMuted text-sm leading-relaxed">
       {{ 'RULES.H2P_P2' | translate }}
      </p>
    </section>

    <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
      <h3 class="text-xl font-bold text-secondary drop-shadow-sm mb-3">{{ 'RULES.ROLES' | translate }}</h3>
      <ul class="space-y-4">
        <li class="flex items-start gap-3">
          <span class="text-2xl mt-0.5">👤</span>
          <div>
            <strong class="text-textPrimary block">{{ 'RULES.CIVIL' | translate }}</strong>
            <span class="text-sm text-textMuted">{{ 'RULES.CIVIL_DESC' | translate }}</span>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-2xl mt-0.5">👽</span>
          <div>
            <strong class="text-primary block">{{ 'RULES.IMPOSTOR' | translate }}</strong>
            <span class="text-sm text-textMuted">{{ 'RULES.IMPOSTOR_DESC' | translate }}</span>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-2xl mt-0.5">🕵️‍♂️</span>
          <div>
            <strong class="text-indigo-400 block">{{ 'RULES.DETECTIVE' | translate }}</strong>
            <span class="text-sm text-textMuted">{{ 'RULES.DETECTIVE_DESC' | translate }}</span>
          </div>
        </li>
      </ul>
    </section>

    <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
      <h3 class="text-xl font-bold text-fuchsia-400 drop-shadow-sm mb-3">{{ 'RULES.GAME_MODES' | translate }}</h3>
      <div class="space-y-3">
        <div class="p-3 bg-glass backdrop-blur rounded-xl border border-glass-border">
          <strong class="text-textPrimary block mb-1">🎭 {{ 'RULES.CLASSIC' | translate }}</strong>
          <span class="text-sm text-textMuted block">{{ 'RULES.CLASSIC_DESC' | translate }}</span>
        </div>
        <div class="p-3 bg-glass backdrop-blur rounded-xl border border-glass-border">
          <strong class="text-textPrimary block mb-1">⏱️ {{ 'RULES.FAST' | translate }}</strong>
          <span class="text-sm text-textMuted block">{{ 'RULES.FAST_DESC' | translate }}</span>
        </div>
        <div class="p-3 bg-glass backdrop-blur rounded-xl border border-glass-border">
          <strong class="text-textPrimary block mb-1">🕵️‍♂️ {{ 'RULES.DETECTIVE_MODE' | translate }}</strong>
          <span class="text-sm text-textMuted block">{{ 'RULES.DETECTIVE_MODE_DESC' | translate }}</span>
        </div>
        <div class="p-3 bg-glass backdrop-blur rounded-xl border border-glass-border">
          <strong class="text-textPrimary block mb-1">🥷 {{ 'RULES.INFILTRATOR' | translate }}</strong>
          <span class="text-sm text-textMuted block">{{ 'RULES.INFILTRATOR_DESC' | translate }}</span>
        </div>
        <div class="p-3 bg-glass backdrop-blur rounded-xl border border-glass-border">
          <strong class="text-textPrimary block mb-1">🤝 {{ 'RULES.TEAM' | translate }}</strong>
          <span class="text-sm text-textMuted block">{{ 'RULES.TEAM_DESC' | translate }}</span>
        </div>
        <div class="p-3 bg-glass backdrop-blur rounded-xl border border-glass-border">
          <strong class="text-textPrimary block mb-1">🌪️ {{ 'RULES.CHAOS' | translate }}</strong>
          <span class="text-sm text-textMuted block">{{ 'RULES.CHAOS_DESC' | translate }}</span>
        </div>
      </div>
    </section>
   </div>

  </div>
 `
})
export class Rules {
  private router = inject(Router);
  authService = inject(AuthService);

  goBack() {
    this.router.navigate(['/']);
  }
}
