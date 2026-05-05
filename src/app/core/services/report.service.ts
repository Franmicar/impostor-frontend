import { Injectable, inject } from '@angular/core';
import { UiService } from './ui/ui.service';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private ui = inject(UiService);

  async sendReport(message: string, uid?: string, type: 'bug' | 'suggestion' = 'bug') {
    this.ui.setLoading(true);
    try {
      const deviceInfo = await Device.getInfo();
      const reportsRef = collection(this.db, 'reports');

      await addDoc(reportsRef, {
        message,
        type,
        userId: uid || 'anonymous',
        appVersion: '1.4.4',
        platform: Capacitor.getPlatform(),
        deviceOS: deviceInfo.operatingSystem,
        deviceOSVersion: deviceInfo.osVersion,
        deviceModel: deviceInfo.model,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error enviando el reporte:', error);
      return false;
    } finally {
      this.ui.setLoading(false);
    }
  }
}
