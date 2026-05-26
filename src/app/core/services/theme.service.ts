import { Injectable, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { combineLatest } from 'rxjs';
import { BillingService } from './billing.service';
import { ThemeAssetLoader } from './theme-asset-loader.service';
import { ASSET_KEYS, LOCAL_ASSET_MAPPING } from '../config/assets.config';

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

        // Suscribirse a cambios premium/temas para revertir tema si caduca
        combineLatest([
            this.billing.isPremium$,
            this.billing.isThemeAlienOwned$,
            this.billing.isThemeMangaOwned$
        ]).pipe(
            takeUntilDestroyed()
        ).subscribe(([isPremium, isAlienOwned, isMangaOwned]) => {
            const t = this.currentTheme();
            if (t === 'neon2' && !isPremium) {
                this.setTheme('neon');
            } else if (t === 'alien' && !isAlienOwned) {
                this.setTheme('neon');
            } else if (t === 'manga' && !isMangaOwned) {
                this.setTheme('neon');
            }
        });
    }

    private async initTheme() {
        const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocalDev) {
            this.downloadedThemes.set({
                'infantil': true,
                'alien': true,
                'manga': true,
                'neon': true,
                'neon2': true
            });
        } else {
            const { value: downloaded } = await Preferences.get({ key: 'impostor-downloaded-themes' });
            if (downloaded) {
                this.downloadedThemes.set(JSON.parse(downloaded));
            }
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
        if (theme === 'neon2' && !this.billing.isPremium) {
            console.warn('Requiere plan Premium para usar este tema');
            return;
        }
        if (theme === 'alien' && !this.billing.isThemeAlienOwned) {
            console.warn('Requiere compra del tema Alien para usarlo');
            return;
        }
        if (theme === 'manga' && !this.billing.isThemeMangaOwned) {
            console.warn('Requiere compra del tema Manga para usarlo');
            return;
        }

        try {
            const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            if (isLocalDev) {
                this.currentTheme.set(theme);
                this.applyTheme(theme);
                await Preferences.set({ key: 'impostor-theme', value: theme });
                return;
            }

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
        
        if (theme === 'neon' || theme === 'neon2' || originalPath.includes('default-avatar.png')) {
            return originalPath;
        }
        
        const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocalDev) {
            const cleanPath = originalPath.replace(/^\/images\//, '/');
            return `/themes/${theme}${cleanPath}`;
        }

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

    resolveAsset(key: string): string {
        const theme = this.currentTheme() as string;
        
        // Determinar la ruta por defecto a partir del key
        let defaultPath = LOCAL_ASSET_MAPPING[key];
        if (!defaultPath && key.startsWith('packages.')) {
            defaultPath = `/images/packages/${key.substring(9)}.png`;
        }
        
        if (!defaultPath) {
            console.warn(`Asset key "${key}" not registered in LOCAL_ASSET_MAPPING`);
            return '/images/default-avatar.png'; // safe fallback
        }

        if (theme === 'neon' || theme === 'neon2' || (key.startsWith('shared.') && key !== 'shared.default_avatar')) {
            return defaultPath;
        }
        
        const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocalDev) {
            const cleanPath = defaultPath.replace(/^\/images\//, '/');
            return `/themes/${theme}${cleanPath}`;
        }

        if (this.downloadedThemes()[theme]) {
            const cleanPath = defaultPath.replace(/^\/images\//, '/');
            if (Capacitor.isNativePlatform()) {
                const fileName = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
                return Capacitor.convertFileSrc(`${this.assetLoader.getDataDirBase()}/themes/${theme}/${fileName}`);
            } else {
                return `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${theme}${cleanPath}`;
            }
        }
        
        return defaultPath;
    }
}
