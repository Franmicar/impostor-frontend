import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import { BillingService } from './billing.service';

@Injectable({
  providedIn: 'root'
})
export class AdsService {
  private isAdMobInitialized = false;
  private readonly bannerAdId = 'ca-app-pub-3940256099942544/6300978111'; // ID Test de Banner
  private readonly interstitialAdId = 'ca-app-pub-3940256099942544/1033173712'; // ID Test de Interstitial

  constructor(
    private billing: BillingService
  ) {}

  async initialize() {
    if (Capacitor.isNativePlatform()) {
      try {
        await AdMob.initialize({});
        this.isAdMobInitialized = true;
        
        // Listen to premium changes. If user becomes premium, hide banner
        this.billing.isPremium$.subscribe(premium => {
          if (premium && this.isAdMobInitialized) {
            this.hideBanner();
          } else if (!premium && this.isAdMobInitialized) {
            this.showBanner();
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
        adSize: BannerAdSize.BANNER,
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
