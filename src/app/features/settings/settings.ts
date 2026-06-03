import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

import { AuthService } from '../../core/services/auth/auth.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { BillingService } from '../../core/services/billing.service';
import { ReportService } from '../../core/services/report.service';
import { ModalComponent } from '../../shared/components/ui/modal.component';
import { HeaderComponent } from '../../shared/components/ui/header.component';
import { AuthProfileComponent } from '../../shared/components/ui/auth-profile.component';
import { ButtonSecondaryComponent } from '../../shared/components/ui/button-secondary.component';
import { UiService } from '../../core/services/ui/ui.service';
import packageJson from '../../../../package.json';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, ModalComponent, HeaderComponent, AuthProfileComponent, ButtonSecondaryComponent],
  template: `
  <div class="flex flex-col min-h-dvh bg-transparent text-textPrimary">
   
   <!-- HEADER -->
   <app-header [showBack]="true" [title]="'SETTINGS.TITLE' | translate" (onBack)="goBack()">
    <div header-extra>
      <app-auth-profile avatarSize="w-10 h-10"></app-auth-profile>
    </div>
   </app-header>

   <div class="flex-1 px-6 flex flex-col w-full mx-auto space-y-4">
    <!-- APP PREFERENCES -->
    <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
      <h3 class="text-xs font-bold text-textMuted uppercase tracking-wider mb-4 border-b border-glass-border pb-2">{{ 'SETTINGS.PREFERENCES' | translate }}</h3>
      
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
        <div class="w-12 h-6 rounded-full transition-colors flex items-center px-1" [ngClass]="options.vibration ? 'bg-secondary' : 'bg-slate-600'">
          <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-transform" [ngClass]="options.vibration ? 'translate-x-6' : 'translate-x-0'"></div>
        </div>
      </div>

      <div class="flex items-center justify-between py-3 border-t border-slate-700/50 cursor-pointer" (click)="toggleOption('sound')">
        <span class="text-textPrimary">{{ 'SETTINGS.SOUND' | translate }}</span>
        <div class="w-12 h-6 rounded-full transition-colors flex items-center px-1" [ngClass]="options.sound ? 'bg-secondary' : 'bg-slate-600'">
          <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-transform" [ngClass]="options.sound ? 'translate-x-6' : 'translate-x-0'"></div>
        </div>
      </div>

      <!-- THEME SELECTOR -->
      <div class="py-4 border-t border-slate-700/50">
        <span class="text-textPrimary block mb-3 font-medium">{{ 'SETTINGS.VISUAL_STYLE' | translate }}</span>
        <div class="flex flex-col gap-2">
          <!-- Tema Principal -->
          <button (click)="themeService.setTheme('neon')" 
              [class.ring-2]="themeService.currentTheme() === 'neon'"
              class="ring-primary relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm">{{ 'SETTINGS.THEME_NEON' | translate }}</span>
          </button>
          <!-- Tema Infantil -->
          <button (click)="selectTheme('infantil')" 
              [class.ring-2]="themeService.currentTheme() === 'infantil'"
              class="ring-orange-400 relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm">{{ 'SETTINGS.THEME_INFANTIL' | translate }}</span>
          </button>
          
          <!-- Tema Neón 2 (Premium) -->
          <button (click)="selectTheme('neon2')" 
              [class.ring-2]="themeService.currentTheme() === 'neon2'"
              class="ring-yellow-400 relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm flex items-center gap-2">
              {{ 'SETTINGS.THEME_NEON_2' | translate }}
              @if (!isPremium()) {
                <span class="text-[0.6rem] bg-gradient-to-r from-primary to-secondary text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">PRO</span>
              }
            </span>
            @if (!isPremium()) {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-textMuted">
               <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
          </button>

          <!-- Tema Alien (Premium) -->
          <button (click)="selectTheme('alien')" 
              [class.ring-2]="themeService.currentTheme() === 'alien'"
              class="ring-green-400 relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm flex items-center gap-2">
              {{ 'SETTINGS.THEME_ALIEN' | translate }}
              @if (!billing.isThemeAlienOwned) {
                <span class="text-[0.6rem] bg-glass border border-glass-border text-secondary px-2 py-0.5 rounded-lg font-bold shadow-[0_0_15px_rgb(var(--color-primary)/0.4)] uppercase tracking-wider select-none">4.99€</span>
              }
            </span>
            @if (!billing.isThemeAlienOwned) {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-textMuted">
               <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
          </button>
 
          <!-- Tema Manga (Premium) -->
          <button (click)="selectTheme('manga')" 
              [class.ring-2]="themeService.currentTheme() === 'manga'"
              class="ring-red-500 relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm flex items-center gap-2">
              {{ 'SETTINGS.THEME_MANGA' | translate }}
              @if (!billing.isThemeMangaOwned) {
                <span class="text-[0.6rem] bg-glass border border-glass-border text-secondary px-2 py-0.5 rounded-lg font-bold shadow-[0_0_15px_rgb(var(--color-primary)/0.4)] uppercase tracking-wider select-none">4.99€</span>
              }
            </span>
            @if (!billing.isThemeMangaOwned) {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-textMuted">
               <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
          </button>
        </div>
      </div>
    </section>

    <!-- CONTENT PREFERENCES -->
    <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
      <h3 class="text-xs font-bold text-textMuted uppercase tracking-wider mb-4 border-b border-glass-border pb-2">{{ 'SETTINGS.CONTENT' | translate }}</h3>
      <button (click)="goToCustomPackage()" class="relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between cursor-pointer">
        <span class="text-textPrimary text-sm flex items-center gap-2">
          {{ 'SETTINGS.CUSTOM_PACKAGES' | translate }}
          @if (!isPremium()) {
            <span class="text-[0.6rem] bg-gradient-to-r from-primary to-secondary text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">PRO</span>
          }
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-textMuted">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </section>

    <!-- SUPPORT & CONTACT -->
    <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
      <h3 class="text-xs font-bold text-textMuted uppercase tracking-wider mb-4 border-b border-glass-border pb-2">{{ 'SETTINGS.SUPPORT_CONTACT' | translate }}</h3>
      
      <button (click)="openReportModal('bug')" class="w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between mb-2">
        <span class="text-textPrimary text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-rose-500"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {{ 'SETTINGS.REPORT_BUG' | translate }}
        </span>
      </button>

      <button (click)="openReportModal('suggestion')" class="w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between">
        <span class="text-textPrimary text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-cyan-400"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.496 1.509 1.333 1.509 2.316V18" /></svg>
          {{ 'SETTINGS.SUGGEST_IMPROVEMENT' | translate }}
        </span>
      </button>
    </section>

    <!-- LEGAL -->
    <section class="bg-glass backdrop-blur-md rounded-2xl p-5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-glass-border">
      <h3 class="text-xs font-bold text-textMuted uppercase tracking-wider mb-4 border-b border-glass-border pb-2">{{ 'SETTINGS.LEGAL' | translate }}</h3>
      <div class="flex flex-col gap-2">
        <button (click)="openLink('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')" class="w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between cursor-pointer">
          <span class="text-textPrimary text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-textMuted"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" /></svg>
            {{ 'PREMIUM.EULA' | translate }}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-textMuted">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <button (click)="openLink('https://impostor-backend-eight.vercel.app/api/privacy?lang=' + translate.currentLang)" class="w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between cursor-pointer">
          <span class="text-textPrimary text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-textMuted"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            {{ 'PREMIUM.PRIVACY_POLICY' | translate }}
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
      <p class="text-textPrimary text-sm">{{ 'SETTINGS.VERSION' | translate:{ version: appVersion } }}</p>
      <p class="text-textMuted text-xs mt-2">support.deceptra&#64;gmail.com</p>
      <p class="text-textMuted text-xs mt-4">{{ 'SETTINGS.DEV_INFO' | translate }}</p>
    </section>

   </div>

   <!-- MODAL REPORTE -->
   <app-modal
     [isOpen]="isReportModalOpen()"
     [title]="reportType() === 'bug' ? ('SETTINGS.REPORT_BUG_TITLE' | translate) : ('SETTINGS.SUGGEST_IMPROVEMENT_TITLE' | translate)"
     [icon]="reportType() === 'bug' ? 'error' : 'success'"
     (onClose)="closeReportModal()">
     
     <p class="text-sm text-textMuted mb-4 w-full text-left">
       {{ reportType() === 'bug' ? ('SETTINGS.REPORT_BUG_DESC' | translate) : ('SETTINGS.SUGGEST_IMPROVEMENT_DESC' | translate) }}
     </p>
     
     <textarea #reportText class="w-full bg-black/40 border border-glass-border rounded-xl p-3 text-white text-sm outline-none focus:border-secondary transition-colors mb-2 resize-none h-32" [placeholder]="'SETTINGS.REPORT_PLACEHOLDER' | translate" maxlength="1000" (input)="0"></textarea>
     <div class="text-xs text-textMuted text-right mb-4">{{ reportText.value.length || 0 }} / 1000</div>
     
     <div modal-footer class="w-full flex gap-3">
       <app-button-secondary (onClick)="closeReportModal()" class="flex-1">
         {{ 'COMMON.CANCEL' | translate }}
       </app-button-secondary>
       <button (click)="sendReport(reportText.value); reportText.value = ''" [disabled]="isSendingReport()" class="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgb(var(--color-secondary)/0.4)] active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50">
         {{ isSendingReport() ? ('SETTINGS.SENDING' | translate) : ('SETTINGS.SEND' | translate) }}
       </button>
     </div>
   </app-modal>

    <!-- MODAL ALERTA -->
    <app-modal
      [isOpen]="alertModal().show"
      [title]="alertModal().title"
      [icon]="alertModal().success ? 'success' : 'error'"
      (onClose)="alertModal.set({show: false, title: '', message: '', success: false})">
      
      <p class="text-base text-textMuted mb-2 w-full text-center">{{ alertModal().message }}</p>
      
      <button modal-footer (click)="alertModal.set({show: false, title: '', message: '', success: false})" class="w-full py-4 bg-glass hover:bg-glass-hover border border-glass-border text-textPrimary rounded-xl font-bold transition-all shadow-[0_0_15px_rgb(var(--color-secondary)/0.4)] active:scale-95 uppercase tracking-widest cursor-pointer">
        {{ 'SETTINGS.CLOSE' | translate }}
      </button>
    </app-modal>

    <!-- TOAST DE ÉXITO -->
    @if (showSuccessToast()) {
      <div class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-5 py-3 rounded-full border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)] backdrop-blur-md z-50 flex items-center gap-2 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4 text-green-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <span class="text-xs font-semibold tracking-wide">{{ toastMessage() }}</span>
      </div>
    }

    <!-- MODAL DESBLOQUEO TEMA -->
    <app-modal
      [isOpen]="isThemeUnlockModalOpen()"
      [title]="'SETTINGS.UNLOCK_THEME_TITLE' | translate:{ theme: getThemeName(selectedUnlockTheme()) }"
      (onClose)="closeThemeUnlockModal()">
      
      <div class="w-full flex flex-col items-center">
        <p class="text-sm text-textMuted mb-5 text-center px-2">
          {{ getThemeUnlockDescKey(selectedUnlockTheme()) | translate }}
        </p>
        
        <!-- Card label -->
        <span class="text-xs font-bold text-primary uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          {{ 'SETTINGS.PREVIEW_LABEL' | translate }}
        </span>

        <!-- Preview Carousel Container -->
        <div class="relative w-full h-80 sm:h-96 bg-black/40 rounded-2xl border border-glass-border overflow-hidden mb-4 flex items-center justify-center select-none shadow-inner">
          <!-- Slide Images -->
          <img 
            [src]="getPreviewImage(selectedUnlockTheme(), currentSlide())" 
            alt="Theme Preview" 
            class="h-full w-full object-contain pointer-events-none transition-all duration-300" 
          />

          <!-- Left Arrow Button -->
          <button 
            (click)="currentSlide.set(currentSlide() === 0 ? 1 : 0)" 
            class="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-glass-border text-textPrimary flex items-center justify-center active:scale-95 transition-all shadow-lg cursor-pointer z-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-secondary">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <!-- Right Arrow Button -->
          <button 
            (click)="currentSlide.set(currentSlide() === 0 ? 1 : 0)" 
            class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-glass-border text-textPrimary flex items-center justify-center active:scale-95 transition-all shadow-lg cursor-pointer z-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-secondary">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <!-- Slide dots -->
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            <div 
              (click)="currentSlide.set(0)"
              class="w-2 h-2 rounded-full cursor-pointer transition-all duration-300 shadow-[0_0_5px_rgba(255,255,255,0.2)]" 
              [class.bg-secondary]="currentSlide() === 0" 
              [class.bg-white/40]="currentSlide() !== 0">
            </div>
            <div 
              (click)="currentSlide.set(1)"
              class="w-2 h-2 rounded-full cursor-pointer transition-all duration-300 shadow-[0_0_5px_rgba(255,255,255,0.2)]" 
              [class.bg-secondary]="currentSlide() === 1" 
              [class.bg-white/40]="currentSlide() !== 1">
            </div>
          </div>
        </div>

        <!-- Reward Info Grid -->
        <div class="w-full grid grid-cols-2 gap-3 mb-6">
          <div class="bg-glass border border-glass-border/30 rounded-2xl p-4 flex flex-col items-center text-center shadow-md relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span class="text-3xl mb-1.5 select-none animate-pulse-slow">👤</span>
            <span class="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5 select-none">{{ 'SETTINGS.VISUAL_STYLE' | translate }}</span>
            <span class="text-sm font-black text-textPrimary select-none">{{ 'SETTINGS.INCLUDES_AVATARS' | translate }}</span>
          </div>
          <div class="bg-glass border border-glass-border/30 rounded-2xl p-4 flex flex-col items-center text-center shadow-md relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span class="text-3xl mb-1.5 select-none animate-pulse-slow">🖼️</span>
            <span class="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-0.5 select-none">{{ 'SETTINGS.VISUAL_STYLE' | translate }}</span>
            <span class="text-sm font-black text-textPrimary select-none">{{ 'SETTINGS.INCLUDES_FRAME' | translate }}</span>
          </div>
        </div>
      </div>

      <!-- Footer actions -->
      <div modal-footer class="w-full flex flex-col gap-2">
        @if (selectedUnlockTheme() === 'infantil' || isThemeOwned(selectedUnlockTheme())) {
          <button (click)="themeService.setTheme(selectedUnlockTheme()); closeThemeUnlockModal()" class="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(var(--color-secondary),0.4)] active:scale-[0.98] uppercase tracking-wider text-xs flex items-center justify-center cursor-pointer">
            {{ 'SETTINGS.APPLY_THEME' | translate }}
          </button>
          <app-button-secondary (onClick)="closeThemeUnlockModal()" class="w-full">
            {{ 'COMMON.CANCEL' | translate }}
          </app-button-secondary>
        } @else if (selectedUnlockTheme() === 'neon2') {
          <button (click)="goToPremiumPlans()" class="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(var(--color-secondary),0.4)] active:scale-[0.98] uppercase tracking-wider text-xs flex items-center justify-center cursor-pointer">
            {{ 'PREMIUM.SUBSCRIBE' | translate }}
          </button>
          <app-button-secondary (onClick)="closeThemeUnlockModal()" class="w-full">
            {{ 'COMMON.CANCEL' | translate }}
          </app-button-secondary>
        } @else {
          <button (click)="buyTheme()" class="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(var(--color-secondary),0.4)] active:scale-[0.98] uppercase tracking-wider text-xs flex items-center justify-center cursor-pointer">
            {{ 'SETTINGS.BUY_THEME' | translate }} (4.99€)
          </button>
          <app-button-secondary (onClick)="closeThemeUnlockModal()" class="w-full">
            {{ 'COMMON.CANCEL' | translate }}
          </app-button-secondary>
        }
      </div>
    </app-modal>
  </div>
 `
})
export class Settings implements OnInit {
  private router = inject(Router);
  public translate = inject(TranslateService);
  authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public billing = inject(BillingService);
  private reportService = inject(ReportService);
  private uiService = inject(UiService);
  private destroyRef = inject(DestroyRef);

  // Modals signals
  isPremium = signal(false);
  isReportModalOpen = signal(false);
  reportType = signal<'bug' | 'suggestion'>('bug');
  isSendingReport = signal(false);
  alertModal = signal({ show: false, title: '', message: '', success: false });
  showSuccessToast = signal(false);
  toastMessage = signal('');
  isThemeUnlockModalOpen = signal(false);
  selectedUnlockTheme = signal<'alien' | 'manga' | 'neon2' | 'infantil'>('alien');
  currentSlide = signal(0);

  currentLang = 'es';
  appVersion = packageJson.version;

  options = {
    vibration: true,
    sound: true
  };

  ngOnInit() {
    this.currentLang = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'es';
    this.billing.isPremium$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(status => {
      setTimeout(() => this.isPremium.set(status));
    });
  }

  async openLink(url: string) {
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url });
      } catch (e) {
        console.error('Error opening native browser link', e);
        window.open(url, '_blank');
      }
    } else {
      window.open(url, '_blank');
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  changeLanguage(lang: string) {
    if (this.currentLang === lang) return;
    this.currentLang = lang;
    this.uiService.setLoading(true);
    
    // Save preference
    Preferences.set({ key: 'impostify_lang', value: lang });
    
    // Change language and wait for the files to be loaded
    this.translate.use(lang).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        // We add a tiny delay so the UI doesn't blink too fast if cached
        setTimeout(() => this.uiService.setLoading(false), 300);
      },
      error: () => {
        this.uiService.setLoading(false);
      }
    });
  }

  toggleOption(key: keyof typeof this.options) {
    this.options[key] = !this.options[key];
  }

  isThemeOwned(theme: Theme): boolean {
    if (theme === 'neon' || theme === 'infantil') return true;
    if (theme === 'neon2') return this.isPremium();
    if (theme === 'alien') return this.billing.isThemeAlienOwned;
    if (theme === 'manga') return this.billing.isThemeMangaOwned;
    return false;
  }

  selectTheme(theme: Theme) {
    if (this.isThemeOwned(theme)) {
      if ((theme === 'alien' || theme === 'manga' || theme === 'infantil') && !this.themeService.downloadedThemes()[theme]) {
        this.openThemeUnlockModal(theme);
      } else {
        this.themeService.setTheme(theme);
      }
    } else {
      this.openThemeUnlockModal(theme as any);
    }
  }

  openThemeUnlockModal(theme: 'alien' | 'manga' | 'neon2' | 'infantil') {
    this.selectedUnlockTheme.set(theme);
    this.currentSlide.set(0);
    this.isThemeUnlockModalOpen.set(true);
  }

  getPreviewImage(theme: 'alien' | 'manga' | 'neon2' | 'infantil', slide: number): string {
    if (theme === 'alien') {
      return slide === 0 ? '/images/preview_alien_home.png' : '/images/preview_alien_setup.png';
    } else if (theme === 'manga') {
      return slide === 0 ? '/images/preview_manga_home.png' : '/images/preview_manga_setup.png';
    } else if (theme === 'neon2') {
      return slide === 0 ? '/images/preview_neon2_home.png' : '/images/preview_neon2_setup.png';
    } else if (theme === 'infantil') {
      return slide === 0 ? '/images/preview_infantil_home.png' : '/images/preview_infantil_setup.png';
    }
    return '';
  }

  closeThemeUnlockModal() {
    this.isThemeUnlockModalOpen.set(false);
  }

  getThemeUnlockDescKey(theme: 'alien' | 'manga' | 'neon2' | 'infantil'): string {
    if (theme === 'neon2') {
      return 'SETTINGS.UNLOCK_THEME_DESC_PRO';
    } else if (theme === 'infantil') {
      return 'SETTINGS.UNLOCK_THEME_DESC_FREE';
    }
    return 'SETTINGS.UNLOCK_THEME_DESC';
  }

  async buyTheme() {
    const theme = this.selectedUnlockTheme();
    if (theme === 'neon2' || theme === 'infantil') return;

    this.uiService.setLoading(true);
    const success = await this.billing.purchaseTheme(theme);
    this.uiService.setLoading(false);
    
    if (success) {
      this.closeThemeUnlockModal();
      this.themeService.setTheme(theme);
      this.toastMessage.set(this.translate.instant('PREMIUM.SUCCESS_MSG'));
      this.showSuccessToast.set(true);
      setTimeout(() => this.showSuccessToast.set(false), 3000);
    } else {
      this.alertModal.set({
        show: true,
        title: this.translate.instant('ALERTS.TITLE_ERROR'),
        message: this.translate.instant('PREMIUM.ERROR_MSG'),
        success: false
      });
    }
  }

  goToPremiumPlans() {
    this.closeThemeUnlockModal();
    this.router.navigate(['/premium']);
  }

  getThemeName(theme: 'alien' | 'manga' | 'neon2' | 'infantil'): string {
    if (theme === 'alien') {
      return this.translate.instant('SETTINGS.THEME_ALIEN');
    } else if (theme === 'manga') {
      return this.translate.instant('SETTINGS.THEME_MANGA');
    } else if (theme === 'neon2') {
      return this.translate.instant('SETTINGS.THEME_NEON_2');
    } else if (theme === 'infantil') {
      return this.translate.instant('SETTINGS.THEME_INFANTIL');
    }
    return '';
  }

  goToCustomPackage() {
    if (!this.isPremium()) {
      this.router.navigate(['/premium']);
      return;
    }
    this.router.navigate(['/custom-package']);
  }

  openReportModal(type: 'bug' | 'suggestion') {
    this.reportType.set(type);
    this.isReportModalOpen.set(true);
  }

  closeReportModal() {
    this.isReportModalOpen.set(false);
  }

  async sendReport(message: string) {
    if (!message || message.trim() === '') return;

    this.isSendingReport.set(true);
    this.uiService.setLoading(true);
    const success = await this.reportService.sendReport(
      message,
      this.authService.userSignal()?.uid,
      this.reportType()
    );
    this.isSendingReport.set(false);
    this.uiService.setLoading(false);
    this.closeReportModal();

    if (success) {
      this.toastMessage.set(this.translate.instant('SETTINGS.SUCCESS_MSG'));
      this.showSuccessToast.set(true);
      setTimeout(() => this.showSuccessToast.set(false), 3000);
    } else {
      this.alertModal.set({
        show: true,
        title: this.translate.instant('SETTINGS.ERROR_TITLE'),
        message: this.translate.instant('SETTINGS.ERROR_MSG'),
        success: false
      });
    }
  }
}
