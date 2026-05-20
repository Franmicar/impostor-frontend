import { Injectable, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { BillingService } from './billing.service';
import { ThemeAssetLoader } from './theme-asset-loader.service';

export type Theme = 'neon' | 'neon2' | 'infantil' | 'alien' | 'manga';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private billing = inject(BillingService);
    private assetLoader = inject(ThemeAssetLoader);
    
    // Estado local gestionado con un Signal
    currentTheme = signal<Theme>('neon');
    // Themes that have been downloaded locally
    downloadedThemes = signal<Record<string, boolean>>({});

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

        try {
            // Si es un tema remoto que requiere descarga y no está descargado
            if (!this.downloadedThemes()[theme] && (theme === 'alien' || theme === 'manga' || theme === 'infantil')) {
                await this.assetLoader.downloadThemeAssets(theme);
                
                const current = this.downloadedThemes();
                current[theme] = true;
                this.downloadedThemes.set({ ...current });
                await Preferences.set({ key: 'impostor-downloaded-themes', value: JSON.stringify(current) });
            }

            this.currentTheme.set(theme);
            this.applyTheme(theme);
            await Preferences.set({ key: 'impostor-theme', value: theme });
        } catch (error) {
            console.error('Error aplicando el tema:', error);
        }
    }

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
            const cleanPath = originalPath.replace(/^\/images\//, '/');
            if (Capacitor.isNativePlatform()) {
                const fileName = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                return Capacitor.convertFileSrc(`${this.assetLoader.getDataDirBase()}/themes/${theme}/${fileName}`);
            } else {
                return `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${theme}${cleanPath}`;
            }
        }
        
        return originalPath;
    }
}
