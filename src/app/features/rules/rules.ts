import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../shared/components/ui/header.component';
import { AuthProfileComponent } from '../../shared/components/ui/auth-profile.component';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [TranslateModule, HeaderComponent, AuthProfileComponent],
  template: `
  <div class="flex flex-col min-h-dvh bg-transparent text-textPrimary">
   <app-header [showBack]="true" [title]="'RULES.TITLE' | translate" (onBack)="goBack()">
    <div header-extra>
      <app-auth-profile avatarSize="w-10 h-10"></app-auth-profile>
    </div>
   </app-header>

   <div class="w-full mx-auto space-y-6 px-6">
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

  goBack() {
    this.router.navigate(['/']);
  }
}
