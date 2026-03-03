import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    // Estado local gestionado con un Signal (Angular v21 Best Practices)
    currentTheme = signal<Theme>('system');

    constructor() {
        this.initTheme();

        // Efecto reactivo para actualizar la clase del HTML cuando el tema cambie
        effect(() => {
            this.applyTheme(this.currentTheme());
        });
    }

    private initTheme() {
        const savedTheme = localStorage.getItem('impostor-theme') as Theme | null;
        if (savedTheme) {
            this.currentTheme.set(savedTheme);
        } else {
            this.currentTheme.set('system');
        }
    }

    setTheme(theme: Theme) {
        this.currentTheme.set(theme);
        localStorage.setItem('impostor-theme', theme);
    }

    private applyTheme(theme: Theme) {
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}
