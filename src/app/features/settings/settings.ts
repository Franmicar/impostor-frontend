import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
        <div class="w-10 h-10 invisible"></div> <!-- Spacer -->
      </header>

      <div class="w-full max-w-lg mx-auto space-y-4">
        
        <!-- ACCOUNT SECTION -->
        <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">{{ 'SETTINGS.ACCOUNT' | translate }}</h3>
            <button class="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors active:scale-95">
                <svg viewBox="0 0 24 24" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {{ 'SETTINGS.LINK_GOOGLE' | translate }}
            </button>
            <p class="text-center text-xs text-slate-500 mt-3">{{ 'SETTINGS.LINK_GOOGLE_INFO' | translate }}</p>
        </section>

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
