import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private _isPremium = new BehaviorSubject<boolean>(false);
  public isPremium$ = this._isPremium.asObservable();

  constructor() {}

  async initialize() {
    if (Capacitor.isNativePlatform()) {
      try {
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        // Sustituir por claves reales en producción
        if (Capacitor.getPlatform() === 'android') {
          await Purchases.configure({ apiKey: (environment as any).revenueCatAndroidKey || 'goog_placeholder_key' });
        } else if (Capacitor.getPlatform() === 'ios') {
          await Purchases.configure({ apiKey: (environment as any).revenueCatIosKey || 'appl_placeholder_key' });
        }
        
        const { customerInfo } = await Purchases.getCustomerInfo();
        this.updatePremiumStatus(customerInfo);

        Purchases.addCustomerInfoUpdateListener((customerInfoUpdate) => {
          this.updatePremiumStatus(customerInfoUpdate);
        });

      } catch (e) {
        console.error('Error initializing RevenueCat', e);
      }
    }
  }

  private updatePremiumStatus(customerInfo: any) {
    // Asumimos que el entitlement se llama "premium"
    const isEntitled = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
    this._isPremium.next(isEntitled);
  }

  get isPremium(): boolean {
    return this._isPremium.value;
  }

  async getOfferings() {
    if (Capacitor.isNativePlatform()) {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          return offerings.current.availablePackages;
        }
      } catch (e) {
        console.error('Error fetching offerings', e);
      }
    }
    // Fallback simulado para web o si falla (Mock data based on requirements)
    return [
      { identifier: 'monthly', packageType: 'MONTHLY', product: { identifier: 'sub_monthly', title: 'Plan Mensual', priceString: '4.99€' } },
      { identifier: 'quarterly', packageType: 'THREE_MONTH', product: { identifier: 'sub_quarterly', title: 'Plan Trimestral', priceString: '11.99€' } },
      { identifier: 'annual', packageType: 'ANNUAL', product: { identifier: 'sub_annual', title: 'Plan Anual', priceString: '39.99€' } }
    ] as any[];
  }

  async purchasePremium(pkg?: any): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        if (pkg) {
          const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
          this.updatePremiumStatus(customerInfo);
          return this.isPremium;
        } else {
          // Backward compatibility: compra el primero
          const offerings = await Purchases.getOfferings();
          if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
            const { customerInfo } = await Purchases.purchasePackage({ aPackage: offerings.current.availablePackages[0] });
            this.updatePremiumStatus(customerInfo);
            return this.isPremium;
          }
        }
      } else {
        // En web simulamos la compra con éxito
        this._isPremium.next(true);
        return true;
      }
    } catch (e) {
      console.error('Error in purchase', e);
    }
    return false;
  }

  async restorePurchases(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const { customerInfo } = await Purchases.restorePurchases();
        this.updatePremiumStatus(customerInfo);
        return this.isPremium;
      } else {
        // En web simulamos la restauración si ya había activado algo antes,
        // o por facilidad lo activamos
        this._isPremium.next(true);
        return true;
      }
    } catch (e) {
      console.error('Error restoring purchases', e);
    }
    return false;
  }
}
