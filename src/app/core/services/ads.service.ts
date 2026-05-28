import { Injectable, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { BillingService } from './billing.service';

@Injectable({
  providedIn: 'root'
})
export class AdsService {
  private isAdMobInitialized = false;
  private readonly bannerAdId = 'ca-app-pub-3940256099942544/6300978111'; // ID Test de Banner
  private readonly interstitialAdId = 'ca-app-pub-3940256099942544/1033173712'; // ID Test de Interstitial
  private destroyRef = inject(DestroyRef);

  constructor(
    private billing: BillingService
  ) { }

  async initialize() {
    if (Capacitor.isNativePlatform()) {
      try {
        // Solicitar el consentimiento de rastreo (ATT) en iOS antes de inicializar anuncios
        if (Capacitor.getPlatform() === 'ios') {
          const trackingInfo = await AdMob.trackingAuthorizationStatus();
          if (trackingInfo.status === 'notDetermined') {
            await AdMob.requestTrackingAuthorization();
          }
        }

        await AdMob.initialize({});
        this.isAdMobInitialized = true;

        // Listen to premium changes. If user becomes premium, hide banner
        this.billing.isPremium$.pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(premium => {
          if (premium && this.isAdMobInitialized) {
            this.hideBanner();
          } else if (!premium && this.isAdMobInitialized) {
            this.showBanner();
          }
        });

        // Hide banner when keyboard is open to avoid overlapping
        Keyboard.addListener('keyboardWillShow', () => {
          if (this.isAdMobInitialized && !this.billing.isPremium) {
            AdMob.hideBanner().catch(e => console.error('Error hiding banner for keyboard', e));
          }
        });

        Keyboard.addListener('keyboardWillHide', () => {
          if (this.isAdMobInitialized && !this.billing.isPremium) {
            AdMob.resumeBanner().catch(e => {
              console.error('Error resuming banner for keyboard', e);
              this.showBanner();
            });
          }
        });
      } catch (e) {
        console.error('Error initializing AdMob', e);
      }
    }
  }

  async showBanner() {
    if (!this.isAdMobInitialized || this.billing.isPremium) return;
    try {
      const options: BannerAdOptions = {
        adId: this.bannerAdId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true,
      };
      await AdMob.showBanner(options);
    } catch (e) {
      console.error('Failed to show banner ad', e);
    }
  }

  async hideBanner() {
    if (!this.isAdMobInitialized) return;
    try {
      await AdMob.hideBanner();
      await AdMob.removeBanner();
    } catch (e) {
      console.error('Failed to hide banner', e);
    }
  }

  async showInterstitial(): Promise<void> {
    if (!this.isAdMobInitialized || this.billing.isPremium) return Promise.resolve();

    return new Promise(async (resolve) => {
      try {
        await AdMob.prepareInterstitial({ adId: this.interstitialAdId, isTesting: true });

        const listener = await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
          listener.remove();
          resolve();
        });

        await AdMob.showInterstitial();
      } catch (e) {
        console.error('Failed to show Interstitial', e);
        resolve(); // Continue game flow if ad fails
      }
    });
  }
}
