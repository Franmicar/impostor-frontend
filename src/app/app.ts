import { Component, signal, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ApiService } from './core/services/api/api.service';
import { ConfirmDialogComponent } from './core/guards/prevent-exit/confirm-dialog.component';
import { ConfirmService } from './core/services/confirm/confirm.service';
import { UiService } from './core/services/ui/ui.service';
import { BillingService } from './core/services/billing.service';
import { AdsService } from './core/services/ads.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  apiService = inject(ApiService);
  uiService = inject(UiService);
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
    
    // Default to 'es' synchronously to prevent empty screens
    translate.use('es');
    
    try {
      Preferences.get({ key: 'impostify_lang' }).then(({ value: savedLang }) => {
        if (savedLang) {
          translate.use(savedLang);
        }
      });
    } catch (e) {
      // Ignored
    }

    this.billingService.initialize().then(() => {
      this.adsService.initialize();
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      // Disable padding on home (/) and play screens
      if (url === '/' || url === '/home' || url.startsWith('/play')) {
        document.body.classList.add('no-pb');
      } else {
        document.body.classList.remove('no-pb');
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
        } else if (url.startsWith('/results')) {
          this.router.navigate(['/']);
        } else {
          this.location.back();
        }
      });
    }
  }
}
