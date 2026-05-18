import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../core/services/auth/auth.service';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { BillingService } from '../../core/services/billing.service';
import { ReportService } from '../../core/services/report.service';
import { ModalComponent } from '../../shared/components/ui/modal.component';
import { HeaderComponent } from '../../shared/components/ui/header.component';
import { AuthProfileComponent } from '../../shared/components/ui/auth-profile.component';
import { UiService } from '../../core/services/ui/ui.service';
import packageJson from '../../../../package.json';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, ModalComponent, HeaderComponent, AuthProfileComponent],
  template: `
  <div class="flex flex-col min-h-dvh bg-transparent text-textPrimary">
   
   <!-- HEADER -->
   <app-header [showBack]="true" [title]="'SETTINGS.TITLE' | translate" (onBack)="goBack()">
    <div header-extra>
      <app-auth-profile avatarSize="w-8 h-8"></app-auth-profile>
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
        <span class="text-textPrimary block mb-3 font-medium">{{ 'SETTINGS.VISUAL_STYLE' | translate }}</span>
        <div class="flex flex-col gap-2">
          <!-- Tema Principal -->
          <button (click)="themeService.setTheme('neon')" 
              [class.ring-2]="themeService.currentTheme() === 'neon'"
              class="ring-primary relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm">{{ 'SETTINGS.THEME_NEON' | translate }}</span>
          </button>
          <!-- Tema Infantil -->
          <button (click)="themeService.setTheme('infantil')" 
              [class.ring-2]="themeService.currentTheme() === 'infantil'"
              class="ring-orange-400 relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm">{{ 'SETTINGS.THEME_INFANTIL' | translate }}</span>
          </button>
          
          <!-- Tema Neón 2 (Premium) -->
          <button (click)="selectPremiumTheme('neon2')" 
              [class.ring-2]="themeService.currentTheme() === 'neon2'"
              class="ring-yellow-400 relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between">
            <span class="text-textPrimary text-sm flex items-center gap-2">
              {{ 'SETTINGS.THEME_NEON_2' | translate }}
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

          <!-- Tema Alien (Premium) -->
          <button (click)="selectPremiumTheme('alien')" 
              [class.ring-2]="themeService.currentTheme() === 'alien'"
              class="ring-green-400 relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between mt-2">
            <span class="text-textPrimary text-sm flex items-center gap-2">
              {{ 'SETTINGS.THEME_ALIEN' | translate }}
              @if (!billing.isPremium) {
                <span class="text-[0.6rem] bg-gradient-to-r from-primary to-secondary text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">PRO / 5€</span>
              }
            </span>
            @if (!billing.isPremium) {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-textMuted">
               <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
          </button>

          <!-- Tema Manga (Premium) -->
          <button (click)="selectPremiumTheme('manga')" 
              [class.ring-2]="themeService.currentTheme() === 'manga'"
              class="ring-red-500 relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between mt-2">
            <span class="text-textPrimary text-sm flex items-center gap-2">
              {{ 'SETTINGS.THEME_MANGA' | translate }}
              @if (!billing.isPremium) {
                <span class="text-[0.6rem] bg-gradient-to-r from-primary to-secondary text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">PRO / 5€</span>
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
        <span class="text-textPrimary block mb-3 font-medium">{{ 'SETTINGS.CONTENT' | translate }}</span>
        <button (click)="goToCustomPackage()" class="relative w-full text-left px-4 py-3 bg-glass hover:bg-glass-hover border border-glass-border rounded-xl transition-all flex items-center justify-between">
          <span class="text-textPrimary text-sm flex items-center gap-2">
            {{ 'SETTINGS.CUSTOM_PACKAGES' | translate }}
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
       <button (click)="closeReportModal()" class="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-glass-border text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgb(var(--color-secondary)/0.4)] active:scale-95 uppercase tracking-widest text-xs">
         {{ 'COMMON.CANCEL' | translate }}
       </button>
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
  </div>
 `
})
export class Settings implements OnInit {
  private router = inject(Router);
  private translate = inject(TranslateService);
  authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public billing = inject(BillingService);
  private reportService = inject(ReportService);
  private uiService = inject(UiService);
  private destroyRef = inject(DestroyRef);

  // Modals signals
  isReportModalOpen = signal(false);
  reportType = signal<'bug' | 'suggestion'>('bug');
  isSendingReport = signal(false);
  alertModal = signal({ show: false, title: '', message: '', success: false });

  currentLang = 'es';
  appVersion = packageJson.version;

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

  selectPremiumTheme(theme: Theme) {
    if (!this.billing.isPremium) {
      this.router.navigate(['/premium']);
      return;
    }
    this.themeService.setTheme(theme);
  }

  goToCustomPackage() {
    if (!this.billing.isPremium) {
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
      this.alertModal.set({
        show: true,
        title: this.translate.instant('SETTINGS.SUCCESS_TITLE'),
        message: this.translate.instant('SETTINGS.SUCCESS_MSG'),
        success: true
      });
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
