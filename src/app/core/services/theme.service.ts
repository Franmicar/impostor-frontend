import { Injectable, signal, effect, inject } from '@angular/core';
import { BillingService } from './billing.service';

export type Theme = 'neon' | 'neon2' | 'infantil';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private billing = inject(BillingService);
    
    // Estado local gestionado con un Signal
    currentTheme = signal<Theme>('neon');

    constructor() {
        this.initTheme();

        // Efecto reactivo para actualizar la clase del HTML cuando el tema cambie
        effect(() => {
            this.applyTheme(this.currentTheme());
        });

        // Suscribirse a cambios premium para revertir tema si caduca
        this.billing.isPremium$.subscribe(isPremium => {
            if (!isPremium && this.currentTheme() === 'neon2') {
                this.setTheme('neon');
            }
        });
    }

    private initTheme() {
        const savedTheme = localStorage.getItem('impostor-theme') as Theme | null;
        if (savedTheme === 'neon' || savedTheme === 'neon2' || savedTheme === 'infantil') {
            // Si intenta cargar neon2 y no es premium, podría haber un pequeño desfase, 
            // pero el subscribe de arriba lo corregirá en cuanto billing termine de cargar.
            this.currentTheme.set(savedTheme);
        } else {
            this.currentTheme.set('neon');
        }
    }

    setTheme(theme: Theme) {
        if (theme === 'neon2' && !this.billing.isPremium) {
            console.warn('Requiere plan Premium para usar este tema');
            return;
        }
        this.currentTheme.set(theme);
        localStorage.setItem('impostor-theme', theme);
    }

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
        const theme = this.currentTheme();
        if (theme === 'infantil') {
            // Ejemplo: /images/setup/mode.png -> /images/infantil/setup/mode.png
            return originalPath.replace('/images/', '/images/infantil/');
        }
        return originalPath;
    }
}
