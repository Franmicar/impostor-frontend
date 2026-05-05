import { Injectable, inject } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthService } from '../auth/auth.service';
import { BillingService } from '../billing.service';
import { UiService } from '../ui/ui.service';
import { environment } from '../../../../environments/environment';

export interface CustomWord {
  word: string;
  fake_word: string;
  hints: string[];
}

export interface CustomPackage {
  id: string;
  name: string;
  words: CustomWord[];
}

@Injectable({
  providedIn: 'root'
})
export class CustomPackageService {
  private auth = inject(AuthService);
  private billing = inject(BillingService);
  private ui = inject(UiService);
  private db: any;

  constructor() {
    const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
    this.db = getFirestore(app);
  }

  async getMyCustomPackage(): Promise<CustomPackage | null> {
    if (!this.billing.isPremium) return null;
    const user = this.auth.userSignal();
    if (!user) return null;

    this.ui.setLoading(true);
    try {
      const docRef = doc(this.db, `users/${user.uid}/custom_packages/main`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as CustomPackage;
      }
      return null;
    } finally {
      this.ui.setLoading(false);
    }
  }

  async saveCustomPackage(pkg: CustomPackage): Promise<void> {
    if (!this.billing.isPremium) throw new Error('Requires premium subscription');
    const user = this.auth.userSignal();
    if (!user) throw new Error('User not authenticated');

    this.ui.setLoading(true);
    try {
      const docRef = doc(this.db, `users/${user.uid}/custom_packages/main`);
      await setDoc(docRef, pkg);
    } finally {
      this.ui.setLoading(false);
    }
  }
}
