import { Component, signal, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ApiService } from './core/services/api/api.service';
import { ConfirmDialogComponent } from './core/guards/prevent-exit/confirm-dialog.component';
import { ConfirmService } from './core/services/confirm/confirm.service';
import { BillingService } from './core/services/billing.service';
import { AdsService } from './core/services/ads.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  apiService = inject(ApiService);
  confirmService = inject(ConfirmService);
  billingService = inject(BillingService);
  adsService = inject(AdsService);
  router = inject(Router);
  location = inject(Location);

  protected readonly title = signal('impostor-frontend');

  constructor() {
    const translate = inject(TranslateService);
    translate.addLangs(['es', 'en', 'fr', 'ca', 'it', 'pt', 'de', 'ru', 'zh', 'ja']);
    translate.setFallbackLang('es');
    translate.use('es');

    this.billingService.initialize().then(() => {
      this.adsService.initialize();
    });

    effect(() => {
      if (this.billingService.isPremium) {
        document.body.classList.add('premium-active');
      } else {
        document.body.classList.remove('premium-active');
      }
    });

    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('backButton', async () => {
        const url = this.router.url;
        if (url === '/' || url === '/home') {
          CapacitorApp.exitApp();
        } else if (url.startsWith('/play') || url.startsWith('/vote') || url.startsWith('/draw')) {
          const confirmed = await this.confirmService.requestConfirmation(
             translate.instant('CONFIRM.MESSAGE')
          );
          if (confirmed) {
            this.router.navigate(['/']);
          }
        } else {
          this.location.back();
        }
      });
    }
  }
}
