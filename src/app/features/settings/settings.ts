import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../core/services/auth/auth.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { BillingService } from '../../core/services/billing.service';
import { IconButtonComponent } from '../../shared/components/ui/icon-button.component';
import { TextHeaderComponent } from '../../shared/components/ui/text-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, IconButtonComponent, TextHeaderComponent],
  template: `
  <div class="flex flex-col min-h-dvh bg-transparent text-textPrimary p-6 overflow-y-auto">
   
   <!-- HEADER -->
   <header class="flex items-center justify-between mb-8 ">
    <app-icon-button (onClick)="goBack()">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
     </svg>
    </app-icon-button>
    <app-text-header>{{ 'SETTINGS.TITLE' | translate }}</app-text-header>
    
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

   <div class="w-full mx-auto space-y-4">
    <!-- APP PREFERENCES -->
    <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
      <h3 class="text-xs font-bold text-textMuted uppercase tracking-wider mb-4 border-b border-white/10 pb-2">{{ 'SETTINGS.PREFERENCES' | translate }}</h3>
      
      <div class="flex items-center justify-between py-3">
        <span class="text-textPrimary font-medium">{{ 'SETTINGS.LANGUAGE' | translate }}</span>
        <div class="relative">
          <select #langSelect (change)="changeLanguage(langSelect.value)" [value]="currentLang" class="appearance-none bg-glass backdrop-blur border border-glass-border text-textPrimary rounded-lg py-2 pl-4 pr-10 outline-none focus:border-cyan-500 transition-colors cursor-pointer text-sm">
            <option value="es">Español (ES)</option>
            <option value="en">English (EN)</option>
            <option value="fr">Français (FR)</option>
            <option value="ca">Català (CA)</option>
            <option value="it">Italiano (IT)</option>
            <option value="pt">Português (PT)</option>
            <option value="de">Deutsch (DE)</option>
            <option value="ru">Русский (RU)</option>
            <option value="zh">中文 (ZH)</option>
            <option value="ja">日本語 (JA)</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-textMuted">
           <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between py-3 border-t border-slate-700/50 cursor-pointer" (click)="toggleOption('vibration')">
        <span class="text-textPrimary">{{ 'SETTINGS.VIBRATION' | translate }}</span>
        <div class="w-12 h-6 rounded-full transition-colors flex items-center px-1" [ngClass]="options.vibration ? 'bg-cyan-500' : 'bg-slate-600'">
          <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-transform" [ngClass]="options.vibration ? 'translate-x-6' : 'translate-x-0'"></div>
        </div>
      </div>

      <div class="flex items-center justify-between py-3 border-t border-slate-700/50 cursor-pointer" (click)="toggleOption('sound')">
        <span class="text-textPrimary">{{ 'SETTINGS.SOUND' | translate }}</span>
        <div class="w-12 h-6 rounded-full transition-colors flex items-center px-1" [ngClass]="options.sound ? 'bg-cyan-500' : 'bg-slate-600'">
          <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-transform" [ngClass]="options.sound ? 'translate-x-6' : 'translate-x-0'"></div>
        </div>
      </div>

      <!-- THEME SELECTOR -->
      <div class="py-4 border-t border-slate-700/50">
        <span class="text-textPrimary block mb-3 font-medium">Estilo Visual</span>
        <div class="flex flex-col gap-2">
          <!-- Tema Principal -->
          <button (click)="themeService.setTheme('neon')" 
              [class.ring-2]="themeService.currentTheme() === 'neon'"
              class="ring-primary relative w-full text-left px-4 py-3 bg-glass hover:bg-white/10 border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm">Neón / Cyberpunk</span>
          </button>
          <!-- Tema Infantil -->
          <button (click)="themeService.setTheme('infantil')" 
              [class.ring-2]="themeService.currentTheme() === 'infantil'"
              class="ring-orange-400 relative w-full text-left px-4 py-3 bg-glass hover:bg-white/10 border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm">Infantil (Familiar)</span>
          </button>
          <!-- Tema Neón 2 (Premium) -->
          <button (click)="selectPremiumTheme()" 
              [class.ring-2]="themeService.currentTheme() === 'neon2'"
              class="ring-yellow-400 relative w-full text-left px-4 py-3 bg-glass hover:bg-white/10 border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm flex items-center gap-2">
              Neón 2
              @if (!billing.isPremium) {
                <span class="text-[0.6rem] bg-gradient-to-r from-primary to-secondary text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">PRO</span>
              }
            </span>
            @if (!billing.isPremium) {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-textMuted">
               <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
          </button>
        </div>
      </div>

      <!-- CONTENT PREFERENCES -->
      <div class="py-4 border-t border-slate-700/50">
        <span class="text-textPrimary block mb-3 font-medium">Contenido</span>
        <button (click)="goToCustomPackage()" class="relative w-full text-left px-4 py-3 bg-glass hover:bg-white/10 border border-glass-border rounded-xl transition-all flex items-center justify-between">
          <span class="text-textPrimary text-sm flex items-center gap-2">
            Paquetes Personalizados
            @if (!billing.isPremium) {
              <span class="text-[0.6rem] bg-gradient-to-r from-primary to-secondary text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">PRO</span>
            }
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-textMuted">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </section>

    <!-- ABOUT -->
    <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border text-center">
      <h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-1 uppercase tracking-wider">
        Deceptra
      </h1>
      <p class="text-textPrimary text-sm">{{ 'SETTINGS.VERSION' | translate }}</p>
      <p class="text-textMuted text-xs mt-4">{{ 'SETTINGS.DEV_INFO' | translate }}</p>
    </section>

   </div>
  </div>
 `
})
export class Settings implements OnInit {
  private router = inject(Router);
  private translate = inject(TranslateService);
  authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public billing = inject(BillingService);

  currentLang = 'es';

  options = {
    vibration: true,
    sound: true
  };

  ngOnInit() {
    this.currentLang = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'es';
  }

  goBack() {
    this.router.navigate(['/']);
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
  }

  toggleOption(key: keyof typeof this.options) {
    this.options[key] = !this.options[key];
  }

  selectPremiumTheme() {
    if (!this.billing.isPremium) {
      this.router.navigate(['/premium']);
      return;
    }
    this.themeService.setTheme('neon2');
  }

  goToCustomPackage() {
    if (!this.billing.isPremium) {
      this.router.navigate(['/premium']);
      return;
    }
    this.router.navigate(['/custom-package']);
  }
}
