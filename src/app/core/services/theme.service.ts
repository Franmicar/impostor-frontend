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
        const isLocalDev = typeof window !== 'undefined' && !Capacitor.isNativePlatform() && (
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' || 
            window.location.hostname.startsWith('192.168.') || 
            window.location.hostname.startsWith('10.') || 
            window.location.hostname.startsWith('172.')
        );
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
            const isLocalDev = typeof window !== 'undefined' && !Capacitor.isNativePlatform() && (
                window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.startsWith('192.168.') || 
                window.location.hostname.startsWith('10.') || 
                window.location.hostname.startsWith('172.')
            );
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
        
        if (originalPath.startsWith('http') || originalPath.startsWith('blob:') || originalPath.startsWith('data:') || originalPath.startsWith('content:') || originalPath.startsWith('file:')) {
            return originalPath;
        }

        if (theme === 'neon' || theme === 'neon2' || originalPath.includes('default-avatar.png')) {
            return originalPath;
        }
        
        const cleanPath = originalPath.replace(/^\/images\//, '/');
        if (this.downloadedThemes()[theme] && Capacitor.isNativePlatform()) {
            const fileName = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
            return Capacitor.convertFileSrc(`${this.assetLoader.getDataDirBase()}/themes/${theme}/${fileName}`);
        } else {
            return `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${theme}${cleanPath}`;
        }
    }

    resolveAsset(key: string): string {
        if (key === 'shared.avatar_frame') {
            return this.getFrameAsset(this.currentTheme());
        }
        if (key === 'shared.default_avatar') {
            return this.getDefaultAvatarAsset(this.currentTheme());
        }

        // Determinar la ruta por defecto a partir del key
        let defaultPath = LOCAL_ASSET_MAPPING[key];
        if (!defaultPath && key.startsWith('packages.')) {
            defaultPath = `/images/packages/${key.substring(9)}.png`;
        }
        if (!defaultPath && key.startsWith('avatars.')) {
            defaultPath = `/images/avatars/${key.substring(8)}.png`;
        }
        
        if (!defaultPath) {
            console.warn(`Asset key "${key}" not registered in LOCAL_ASSET_MAPPING`);
            return '/images/default-avatar.png'; // safe fallback
        }

        // Determinar a qué tema pertenece este asset específico
        let assetTheme = this.currentTheme() as string;
        if (key.startsWith('avatars.')) {
            const name = key.substring(8);
            const idx = name.indexOf('_');
            if (idx > 0) {
                const prefix = name.substring(0, idx);
                if (prefix === 'neon' || prefix === 'neon2' || prefix === 'alien' || prefix === 'manga' || prefix === 'infantil') {
                    assetTheme = prefix;
                }
            }
        }


        if (assetTheme === 'neon' || assetTheme === 'neon2' || (key.startsWith('shared.') && key !== 'shared.default_avatar' && key !== 'shared.avatar_frame')) {
            return defaultPath;
        }
        
        const cleanPath = defaultPath.replace(/^\/images\//, '/');
        if (this.downloadedThemes()[assetTheme] && Capacitor.isNativePlatform()) {
            const fileName = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
            return Capacitor.convertFileSrc(`${this.assetLoader.getDataDirBase()}/themes/${assetTheme}/${fileName}`);
        } else {
            return `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${assetTheme}${cleanPath}`;
        }
    }

    getThemeAvatars(theme?: Theme): string[] {
        const t = theme || this.currentTheme();
        if (t === 'neon') {
            return ['neon_hacker', 'neon_dj', 'neon_cyborg', 'neon_male', 'neon_female'];
        }
        if (t === 'neon2') {
            return ['neon2_hacker', 'neon2_dj', 'neon2_cyborg', 'neon2_male', 'neon2_female'];
        }
        if (t === 'alien') {
            return ['alien_male', 'alien_female', 'alien_grey', 'alien_larva', 'alien_nebula'];
        }
        if (t === 'manga') {
            return ['manga_male', 'manga_female', 'manga_detective', 'manga_impostor', 'manga_chibi'];
        }
        if (t === 'infantil') {
            return ['infantil_male', 'infantil_female', 'infantil_toy', 'infantil_dino', 'infantil_bear'];
        }
        return [];
    }

    getFrameAsset(themeName: string): string {
        const t = themeName || this.currentTheme();
        if (t === 'neon') {
            return '/images/neon_frame.png';
        }
        if (t === 'neon2') {
            return '/images/neon2_frame.png';
        }
        if (this.downloadedThemes()[t] && Capacitor.isNativePlatform()) {
            return Capacitor.convertFileSrc(`${this.assetLoader.getDataDirBase()}/themes/${t}/${t}_frame.png`);
        } else {
            return `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${t}/${t}_frame.png`;
        }
    }

    getDefaultAvatarAsset(themeName: string): string {
        const t = themeName || this.currentTheme();
        if (t === 'neon') {
            return '/images/default-avatar.png';
        }
        if (t === 'neon2') {
            return '/images/neon2_default_avatar.png';
        }
        if (this.downloadedThemes()[t] && Capacitor.isNativePlatform()) {
            return Capacitor.convertFileSrc(`${this.assetLoader.getDataDirBase()}/themes/${t}/default-avatar.png`);
        } else {
            return `https://pub-837e7a3cc573402186a8d3e2323727e2.r2.dev/themes/${t}/default-avatar.png`;
        }
    }
}
