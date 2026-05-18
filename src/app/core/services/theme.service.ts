import { Injectable, signal, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { BillingService } from './billing.service';
import { UiService } from './ui/ui.service';

export type Theme = 'neon' | 'neon2' | 'infantil' | 'alien' | 'manga';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private billing = inject(BillingService);
    private ui = inject(UiService);
    
    // Estado local gestionado con un Signal
    currentTheme = signal<Theme>('neon');
    // Themes that have been downloaded locally
    downloadedThemes = signal<Record<string, boolean>>({});
    private dataDirBase: string = '';

    constructor() {
        this.initTheme();

        // Suscribirse a cambios premium para revertir tema si caduca
        this.billing.isPremium$.pipe(
            takeUntilDestroyed()
        ).subscribe(isPremium => {
            const t = this.currentTheme();
            if (!isPremium && (t === 'neon2' || t === 'alien' || t === 'manga')) {
                this.setTheme('neon');
            }
        });
    }

    private async initTheme() {
        if (Capacitor.isNativePlatform()) {
            const uriResult = await Filesystem.getUri({ path: '', directory: Directory.Data });
            this.dataDirBase = uriResult.uri;
        }

        const { value: downloaded } = await Preferences.get({ key: 'impostor-downloaded-themes' });
        if (downloaded) {
            this.downloadedThemes.set(JSON.parse(downloaded));
        }

        const { value } = await Preferences.get({ key: 'impostor-theme' });
        const savedTheme = value as string | null;
        if (savedTheme === 'neon' || savedTheme === 'neon2' || savedTheme === 'infantil' || savedTheme === 'alien' || savedTheme === 'manga' || (savedTheme && this.downloadedThemes()[savedTheme])) {
            this.currentTheme.set(savedTheme as Theme);
            this.applyTheme(savedTheme as Theme);
        } else {
            this.currentTheme.set('neon');
            this.applyTheme('neon');
        }
    }

    async setTheme(theme: Theme) {
        if ((theme === 'neon2' || theme === 'alien' || theme === 'manga') && !this.billing.isPremium) {
            console.warn('Requiere plan Premium para usar este tema');
            return;
        }

        this.ui.setLoading(true);

        try {
            // Si es un tema remoto que requiere descarga y no está descargado
            if (!this.downloadedThemes()[theme] && (theme === 'alien' || theme === 'manga' || theme === 'infantil')) {
                await this.downloadThemeAssets(theme);
            }

            // Pequeño delay para permitir que la barra de carga se muestre en pantalla y mejore la percepción del cambio de tema
            await new Promise(resolve => setTimeout(resolve, 400));

            this.currentTheme.set(theme);
            this.applyTheme(theme);
            await Preferences.set({ key: 'impostor-theme', value: theme });
        } catch (error) {
            console.error('Error aplicando el tema:', error);
            // Optionally could emit a UI error event
        } finally {
            this.ui.setLoading(false);
        }
    }

    private async downloadThemeAssets(theme: string) {
        const manifestUrl = `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${theme}/manifest.json`;
        try {
            const res = await fetch(manifestUrl);
            if (!res.ok) throw new Error('Manifest no encontrado');
            const manifest = await res.json();
            const assets: string[] = manifest.assets;

            if (Capacitor.isNativePlatform()) {
                for (const asset of assets) {
                    const assetUrl = `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${theme}${asset}`;
                    const response = await fetch(assetUrl);
                    const blob = await response.blob();
                    const base64 = await this.convertBlobToBase64(blob);

                    const fileName = asset.startsWith('/') ? asset.substring(1) : asset;
                    
                    await Filesystem.writeFile({
                        path: `themes/${theme}/${fileName}`,
                        data: base64,
                        directory: Directory.Data,
                        recursive: true
                    });
                }
            }

            const current = this.downloadedThemes();
            current[theme] = true;
            this.downloadedThemes.set({ ...current });
            await Preferences.set({ key: 'impostor-downloaded-themes', value: JSON.stringify(current) });
            
        } catch (error) {
            console.error('Error downloading theme assets:', error);
            throw new Error('Failed to download theme');
        }
    }

    private convertBlobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
    });

    private applyTheme(theme: Theme) {
        // Limpiamos clases previas
        document.documentElement.classList.remove('theme-neon', 'theme-neon2', 'theme-infantil', 'theme-alien', 'theme-manga', 'dark', 'light');
        
        // Añadimos la clase del tema actual
        document.documentElement.classList.add(`theme-${theme}`);
        
        // Por compatibilidad de base con tailwind oscuro
        document.documentElement.classList.add('dark');
    }

    getImagePath(originalPath: string): string {
        const theme = this.currentTheme() as string;
        
        if (this.downloadedThemes()[theme]) {
            if (Capacitor.isNativePlatform()) {
                const fileName = originalPath.startsWith('/') ? originalPath.substring(1) : originalPath;
                return Capacitor.convertFileSrc(`${this.dataDirBase}/themes/${theme}/${fileName}`);
            } else {
                return `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${theme}${originalPath}`;
            }
        }
        
        return originalPath;
    }
}
