import { Injectable, inject } from '@angular/core';
import { UiService } from './ui/ui.service';
import { environment } from '../../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { ApiService } from './api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private ui = inject(UiService);
  private api = inject(ApiService);

  async sendReport(message: string, uid?: string, type: 'bug' | 'suggestion' = 'bug') {
    try {
      const deviceInfo = await Device.getInfo();
      const success = await this.api.submitReport({
        message,
        type,
        uid: uid || 'anonymous',
        appVersion: '1.5.1',
        platform: Capacitor.getPlatform(),
        deviceOS: deviceInfo.operatingSystem,
        deviceOSVersion: deviceInfo.osVersion,
        deviceModel: deviceInfo.model
      });
      return success;
    } catch (error) {
      console.error('Error enviando el reporte:', error);
      return false;
    }
  }
}
