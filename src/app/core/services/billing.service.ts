import { Injectable, inject, effect } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL, PRODUCT_CATEGORY } from '@revenuecat/purchases-capacitor';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth/auth.service';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private _isPremiumRevenueCat = new BehaviorSubject<boolean>(false);
  private _isPremiumTester = new BehaviorSubject<boolean>(false);
  private _isThemeAlienOwnedRevenueCat = new BehaviorSubject<boolean>(false);
  private _isThemeMangaOwnedRevenueCat = new BehaviorSubject<boolean>(false);

  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private auth = inject(AuthService);

  public isPremium$ = combineLatest([this._isPremiumRevenueCat, this._isPremiumTester]).pipe(
    map(([revenueCatPremium, testerPremium]) => revenueCatPremium || testerPremium)
  );

  public isThemeAlienOwned$ = this._isThemeAlienOwnedRevenueCat.asObservable();
  public isThemeMangaOwned$ = this._isThemeMangaOwnedRevenueCat.asObservable();

  constructor() {
    // Listen to auth changes manually (effect requires injection context)
    effect(() => {
      const user = this.auth.userSignal();
      if (user) {
        this.checkTesterStatus(user.uid);
      } else {
        this._isPremiumTester.next(false);
      }
    });
  }

  private async checkTesterStatus(uid: string) {
    try {
      const docRef = doc(this.db, `users/${uid}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data()['isPremiumTester']) {
        this._isPremiumTester.next(true);
      } else {
        this._isPremiumTester.next(false);
      }
    } catch (e) {
      console.error('Error checking tester status', e);
      this._isPremiumTester.next(false);
    }
  }

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
    this._isPremiumRevenueCat.next(isEntitled);

    // Entitlement de temas individuales
    const isAlienEntitled = typeof customerInfo.entitlements.active['theme_alien'] !== 'undefined' || typeof customerInfo.entitlements.active['alien'] !== 'undefined';
    this._isThemeAlienOwnedRevenueCat.next(isAlienEntitled);

    const isMangaEntitled = typeof customerInfo.entitlements.active['theme_manga'] !== 'undefined' || typeof customerInfo.entitlements.active['manga'] !== 'undefined';
    this._isThemeMangaOwnedRevenueCat.next(isMangaEntitled);
  }

  get isPremium(): boolean {
    return this._isPremiumRevenueCat.value || this._isPremiumTester.value;
  }

  get isThemeAlienOwned(): boolean {
    return this._isThemeAlienOwnedRevenueCat.value || this._isPremiumTester.value;
  }

  get isThemeMangaOwned(): boolean {
    return this._isThemeMangaOwnedRevenueCat.value || this._isPremiumTester.value;
  }

  async getOfferings() {
    if (Capacitor.isNativePlatform()) {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          return offerings.current.availablePackages;
        } else {
          console.warn('RevenueCat: offerings.current es null o no tiene paquetes disponibles. Asegúrate de configurar la Oferta Activa (Current Offering) en el panel de RevenueCat.');
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
          // Evitar crash si es un paquete simulado en nativo
          if (!pkg.presentedOfferingContext) {
            console.error('Error: Intentando comprar un paquete simulado en plataforma nativa. Esto ocurre porque no hay una Oferta Activa (Current Offering) configurada en RevenueCat.');
            return false;
          }
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
        this._isPremiumRevenueCat.next(true);
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
        return true;
      } else {
        // En web simulamos la restauración activándolo todo
        this._isPremiumRevenueCat.next(true);
        this._isThemeAlienOwnedRevenueCat.next(true);
        this._isThemeMangaOwnedRevenueCat.next(true);
        return true;
      }
    } catch (e) {
      console.error('Error restoring purchases', e);
    }
    return false;
  }

  async purchaseTheme(themeId: 'alien' | 'manga'): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const offerings = await Purchases.getOfferings();
        let pkg: any = null;
        for (const offName of Object.keys(offerings.all)) {
          const offering = offerings.all[offName];
          const found = offering.availablePackages.find(p => p.identifier === `theme_${themeId}` || p.identifier === themeId);
          if (found) {
            pkg = found;
            break;
          }
        }

        if (pkg) {
          const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
          this.updatePremiumStatus(customerInfo);
          return themeId === 'alien' ? this.isThemeAlienOwned : this.isThemeMangaOwned;
        } else {
          // Fallback a compra directa de producto si no está en offerings
          const productId = themeId === 'alien' ? 'theme_alien' : 'theme_manga';
          const { products } = await Purchases.getProducts({ productIdentifiers: [productId], type: PRODUCT_CATEGORY.NON_SUBSCRIPTION });
          if (products && products.length > 0) {
            const { customerInfo } = await Purchases.purchaseStoreProduct({ product: products[0] });
            this.updatePremiumStatus(customerInfo);
          } else {
            console.error(`RevenueCat: Product ${productId} not found for purchase.`);
          }
          return themeId === 'alien' ? this.isThemeAlienOwned : this.isThemeMangaOwned;
        }
      } else {
        // En web simulamos la compra del tema
        if (themeId === 'alien') {
          this._isThemeAlienOwnedRevenueCat.next(true);
        } else {
          this._isThemeMangaOwnedRevenueCat.next(true);
        }
        return true;
      }
    } catch (e) {
      console.error(`Error in purchaseTheme for ${themeId}`, e);
    }
    return false;
  }
}
