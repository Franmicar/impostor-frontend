import { Injectable, signal, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { BillingService } from './billing.service';
import { UiService } from './ui/ui.service';

export type Theme = 'neon' | 'neon2' | 'infantil';

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

    // Lista de assets requeridos para descargar un tema remoto (ejemplo de catálogo)
    private themeRegistry: Record<string, { path: string, url: string }[]> = {
        'alien': [
            { path: '/images/alien/home_impostor_mask.png', url: 'https://impostor-backend-eight.vercel.app/themes/alien/mask.png' }
            // Agregaríamos el resto de imágenes aquí
        ]
    };

    constructor() {
        this.initTheme();

        // Efecto reactivo para actualizar la clase del HTML cuando el tema cambie
        effect(() => {
            this.applyTheme(this.currentTheme());
        });

        // Suscribirse a cambios premium para revertir tema si caduca
        this.billing.isPremium$.pipe(
            takeUntilDestroyed()
        ).subscribe(isPremium => {
            if (!isPremium && this.currentTheme() === 'neon2') {
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
        if (savedTheme === 'neon' || savedTheme === 'neon2' || savedTheme === 'infantil' || (savedTheme && this.downloadedThemes()[savedTheme])) {
            this.currentTheme.set(savedTheme as Theme);
        } else {
            this.currentTheme.set('neon');
        }
    }

    async setTheme(theme: Theme) {
        if (theme === 'neon2' && !this.billing.isPremium) {
            console.warn('Requiere plan Premium para usar este tema');
            return;
        }

        this.ui.setLoading(true);

        // Si es un tema remoto que requiere descarga y no está descargado
        if (this.themeRegistry[theme] && !this.downloadedThemes()[theme]) {
            await this.downloadThemeAssets(theme);
        }

        // Pequeño delay para permitir que la barra de carga se muestre en pantalla y mejore la percepción del cambio de tema
        await new Promise(resolve => setTimeout(resolve, 400));

        this.currentTheme.set(theme);
        await Preferences.set({ key: 'impostor-theme', value: theme });
        
        this.ui.setLoading(false);
    }

    private async downloadThemeAssets(theme: string) {
        if (!Capacitor.isNativePlatform()) return; // En web podríamos usar la URL directa
        const assets = this.themeRegistry[theme];
        if (!assets) return;

        try {
            for (const asset of assets) {
                const response = await fetch(asset.url);
                const blob = await response.blob();
                const base64 = await this.convertBlobToBase64(blob);

                const fileName = asset.path.startsWith('/') ? asset.path.substring(1) : asset.path;
                
                await Filesystem.writeFile({
                    path: `themes/${theme}/${fileName}`,
                    data: base64,
                    directory: Directory.Data,
                    recursive: true
                });
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
        document.documentElement.classList.remove('theme-neon', 'theme-neon2', 'theme-infantil', 'dark', 'light');
        
        // Añadimos la clase del tema actual
        document.documentElement.classList.add(`theme-${theme}`);
        
        // Por compatibilidad de base con tailwind oscuro
        document.documentElement.classList.add('dark');
    }

    // Retorna la ruta de la imagen dependiendo del tema.
    // Si el tema es infantil, buscará en /images/infantil/...
    // neon2 usa las mismas de neon pero con filtro CSS.
    getImagePath(originalPath: string): string {
        const theme = this.currentTheme() as string;
        
        if (theme === 'infantil') {
            return originalPath.replace('/images/', '/images/infantil/');
        }
        
        if (this.downloadedThemes()[theme] && Capacitor.isNativePlatform()) {
            // El path original suele ser "/images/algo.png"
            const fileName = originalPath.startsWith('/') ? originalPath.substring(1) : originalPath;
            // Retorna la ruta local. Esto requiere que el componente HTML lo maneje bien.
            // Para simplificar, Capacitor en iOS y Android puede servir desde Directory.Data usando la URL.
            // Una opción más robusta sería precargar un mapa de URLs con Capacitor.convertFileSrc().
            // Asumiremos que el componente HTML puede vincular a la ruta local si le damos Capacitor.convertFileSrc.
            // Sin embargo, getImagePath es síncrona. Si necesitamos el FileSrc real, 
            // podemos componerlo: `_capacitor_file_://...` pero Capacitor no expone el path exacto sin llamada async.
            // Para la arquitectura actual, una solución es guardar el basepath del Directory.Data en el inicio,
            // o cargar la imagen asíncronamente en el HTML.
            // Dado que `getImagePath` se asume estática, usaremos el path si web, si no `null` y manejar asíncrono.
            
            // Para evitar problemas de rendering síncrono, se sugiere usar la URL en la web (si web) 
            // y para móvil, esto es un punto de entrada para un Pipe asíncrono futuro.
            // Por ahora reemplazamos con el patrón local predecible si lo conocemos, o pasamos la original.
            if (!Capacitor.isNativePlatform()) {
                 const asset = this.themeRegistry[theme]?.find(a => a.path === originalPath);
                 if (asset) return asset.url;
            }
        }
        
        return originalPath;
    }
}
