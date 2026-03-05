import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../core/services/auth/auth.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
    <div class="flex flex-col min-h-screen bg-transparent text-slate-50 p-6 overflow-y-auto">
      
      <!-- HEADER -->
      <header class="flex items-center justify-between mb-8 pt-4">
        <button (click)="goBack()" class="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full bg-glass border border-glass-border backdrop-blur-md text-slate-300 hover:text-white transition-colors active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgba(242,13,185,0.4)] flex-1 text-center">{{ 'SETTINGS.TITLE' | translate }}</h2>
        
        <div class="flex items-center justify-end shrink-0 w-10">
          @if (authService.userSignal()) {
            <img [src]="authService.userSignal()?.photoURL || '/images/default-avatar.png'" referrerpolicy="no-referrer" class="w-8 h-8 rounded-full border-2 border-secondary shadow-[0_0_10px_rgba(13,242,242,0.4)] cursor-pointer" (click)="authService.logout()" title="Cerrar sesión" />
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
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">{{ 'SETTINGS.PREFERENCES' | translate }}</h3>
            
            <div class="flex items-center justify-between py-3">
                <span class="text-slate-200 font-medium">{{ 'SETTINGS.LANGUAGE' | translate }}</span>
                <div class="relative">
                    <select #langSelect (change)="changeLanguage(langSelect.value)" [value]="currentLang" class="appearance-none bg-black/30 backdrop-blur border border-glass-border text-white rounded-lg py-2 pl-4 pr-10 outline-none focus:border-cyan-500 transition-colors cursor-pointer text-sm">
                        <option value="es">Español (ES)</option>
                        <option value="en">English (EN)</option>
                        <option value="fr">Français (FR)</option>
                        <option value="ca">Català (CA)</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between py-3 border-t border-slate-700/50 cursor-pointer" (click)="toggleOption('vibration')">
                <span class="text-slate-200">{{ 'SETTINGS.VIBRATION' | translate }}</span>
                <div class="w-12 h-6 rounded-full transition-colors flex items-center px-1" [ngClass]="options.vibration ? 'bg-cyan-500' : 'bg-slate-600'">
                    <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-transform" [ngClass]="options.vibration ? 'translate-x-6' : 'translate-x-0'"></div>
                </div>
            </div>

            <div class="flex items-center justify-between py-3 border-t border-slate-700/50 cursor-pointer" (click)="toggleOption('sound')">
                <span class="text-slate-200">{{ 'SETTINGS.SOUND' | translate }}</span>
                <div class="w-12 h-6 rounded-full transition-colors flex items-center px-1" [ngClass]="options.sound ? 'bg-cyan-500' : 'bg-slate-600'">
                    <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-transform" [ngClass]="options.sound ? 'translate-x-6' : 'translate-x-0'"></div>
                </div>
            </div>

            <div class="flex items-center justify-between py-3 border-t border-slate-700/50 cursor-pointer" (click)="toggleOption('darkTheme')">
                <span class="text-slate-200">{{ 'SETTINGS.DARK_THEME' | translate }}</span>
                <div class="w-12 h-6 rounded-full transition-colors flex items-center px-1" [ngClass]="options.darkTheme ? 'bg-cyan-500' : 'bg-slate-600'">
                    <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-transform" [ngClass]="options.darkTheme ? 'translate-x-6' : 'translate-x-0'"></div>
                </div>
            </div>
        </section>

        <!-- ABOUT -->
        <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border text-center">
            <h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-1">
                El Impostor
            </h1>
            <p class="text-slate-500 text-sm">{{ 'SETTINGS.VERSION' | translate }}</p>
            <p class="text-slate-600 text-xs mt-4">{{ 'SETTINGS.DEV_INFO' | translate }}</p>
        </section>

      </div>
    </div>
  `
})
export class Settings implements OnInit {
    private router = inject(Router);
    private translate = inject(TranslateService);
    authService = inject(AuthService);

    currentLang = 'es';

    options = {
        vibration: true,
        sound: true,
        darkTheme: true
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
}
