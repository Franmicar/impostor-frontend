import { Injectable } from '@angular/core';
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

  async sendReport(message: string, uid?: string, type: 'bug' | 'suggestion' = 'bug') {
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
    }
  }
}
