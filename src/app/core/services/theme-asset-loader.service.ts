import { Injectable, inject } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { UiService } from './ui/ui.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeAssetLoader {
  private ui = inject(UiService);
  private dataDirBase: string = '';

  constructor() {
    this.initDataDir();
  }

  private async initDataDir() {
    if (Capacitor.isNativePlatform()) {
      try {
        const uriResult = await Filesystem.getUri({ path: '', directory: Directory.Data });
        this.dataDirBase = uriResult.uri;
      } catch (error) {
        console.error('Error initializing data directory in ThemeAssetLoader:', error);
      }
    }
  }

  getDataDirBase(): string {
    return this.dataDirBase;
  }

  async downloadThemeAssets(theme: string): Promise<void> {
    this.ui.setLoading(true);
    const manifestUrl = `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${theme}/manifest.json`;
    
    try {
      const res = await fetch(manifestUrl);
      if (!res.ok) throw new Error('Manifest not found');
      const manifest = await res.json();
      const assets: string[] = manifest.assets;

      if (Capacitor.isNativePlatform()) {
        for (const asset of assets) {
          const cleanPath = asset.replace(/^\/images\//, '/');
          const assetUrl = `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${theme}${cleanPath}`;
          const response = await fetch(assetUrl);
          if (!response.ok) throw new Error(`Failed to fetch asset: ${assetUrl}`);
          
          const blob = await response.blob();
          const base64 = await this.convertBlobToBase64(blob);

          const fileName = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
          
          await Filesystem.writeFile({
            path: `themes/${theme}/${fileName}`,
            data: base64,
            directory: Directory.Data,
            recursive: true
          });
        }
      }
    } catch (error) {
      console.error(`Error downloading theme assets for ${theme}:`, error);
      throw new Error(`Failed to download theme ${theme}`);
    } finally {
      this.ui.setLoading(false);
    }
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }
}
