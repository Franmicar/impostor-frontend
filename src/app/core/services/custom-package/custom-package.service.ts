import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { BillingService } from '../billing.service';

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
  private firestore: Firestore = inject(Firestore);
  private auth = inject(AuthService);
  private billing = inject(BillingService);

  async getMyCustomPackage(): Promise<CustomPackage | null> {
    if (!this.billing.isPremium) return null;
    const user = this.auth.userSignal();
    if (!user) return null;

    const docRef = doc(this.firestore, `users/${user.uid}/custom_packages/main`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CustomPackage;
    }
    return null;
  }

  async saveCustomPackage(pkg: CustomPackage): Promise<void> {
    if (!this.billing.isPremium) throw new Error('Requires premium subscription');
    const user = this.auth.userSignal();
    if (!user) throw new Error('User not authenticated');

    const docRef = doc(this.firestore, `users/${user.uid}/custom_packages/main`);
    await setDoc(docRef, pkg);
  }
}
