import { Injectable, inject, signal, computed, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export interface Package {
    id: string;
    name: string;
    description: string;
    wordCount?: number;
    imageId?: string;
    isPremium?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private translate = inject(TranslateService);
    private apiUrl = isDevMode() ? 'http://localhost:3000/api' : 'https://impostor-backend-eight.vercel.app/api';

    // Signals para state management simple y robusto (Zoneless compliant)
    // Signals para state management simple y robusto
    packages = signal<Package[]>([]);

    private pendingRequests = signal<number>(0);
    isLoading = computed(() => this.pendingRequests() > 0);

    error = signal<string | null>(null);

    private startRequest() {
        this.pendingRequests.update(v => v + 1);
    }

    private endRequest() {
        this.pendingRequests.update(v => Math.max(0, v - 1));
    }

    /**
     * Silently wakes up the backend and preloads packages without showing the loading screen
     */
    async preloadPackages() {
        if (this.packages().length > 0) return; // Already loaded

        try {
            const currentLang = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'es';
            const response = await firstValueFrom(
                this.http.get<{ success: boolean, data: Package[] }>(`${this.apiUrl}/packages?lang=${currentLang}`)
            );
            if (response && response.success) {
                this.packages.set(response.data);
            }
        } catch (err: any) {
            console.warn('Background preload failed (expected on cold starts), will retry on Setup', err);
        }
    }

    /**
     * Obtiene la lista de paquetes funcionales desde la API
     */
    async fetchPackages() {
        if (this.packages().length > 0) return; // Si ya están cacheados, no bloquemos la UI

        this.startRequest();
        this.error.set(null);
        try {
            const currentLang = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'es';
            const response = await firstValueFrom(
                this.http.get<{ success: boolean, data: Package[] }>(`${this.apiUrl}/packages?lang=${currentLang}`)
            );
            if (response && response.success) {
                this.packages.set(response.data);
            }
        } catch (err: any) {
            console.warn('Error fetching packages from API, using mock data for UI testing', err);
            // Fallback mock data if backend is not running
            this.packages.set([
                { id: 'mock-1', name: 'Fiesta Épica', description: 'Palabras ideales para la fiesta', wordCount: 50 },
                { id: 'mock-2', name: 'Nerd de la tecnología', description: 'Términos de programación', wordCount: 120 },
                { id: 'mock-3', name: 'Comida Deliciosa', description: 'Ingredientes y platos', wordCount: 85 },
                { id: 'mock-4', name: 'Películas de Culto', description: 'Cine clásico y palomitas', wordCount: 200 }
            ]);
            this.error.set('Modo Local (Sin Backend)');
        } finally {
            this.endRequest();
        }
    }

    /**
     * Obtiene la lista de palabras de un paquete especifico
     */
    async getWordsByPackage(packageId: string): Promise<{ word: string, hint: string, fakeWord: string }[]> {
        this.startRequest();
        this.error.set(null);
        try {
            const currentLang = this.translate.currentLang || this.translate.defaultLang || 'es';
            const response = await firstValueFrom(
                this.http.get<{ success: boolean, data: { word: string, hint?: string, hints?: string[], fakeWord?: string }[] }>(`${this.apiUrl}/packages/${packageId}/words?lang=${currentLang}`)
            );
            if (response && response.success) {
                return response.data.map(w => ({
                    word: w.word,
                    hint: w.hints && w.hints.length > 0 ? w.hints[Math.floor(Math.random() * w.hints.length)] : (w.hint || 'Pista genérica'),
                    fakeWord: w.fakeWord || 'Falsa'
                }));
            }
            return [];
        } catch (err: any) {
            console.warn('Error fetching words from API, returning mock words', err);
            // Return some mock words based on ID to keep the game flowing if backend is offline
            if (packageId === 'mock-1') return [
                { word: 'Cerveza', hint: 'Alcohol', fakeWord: 'Vino' },
                { word: 'Confeti', hint: 'Colores', fakeWord: 'Serpentina' },
                { word: 'Pastel', hint: 'Dulce', fakeWord: 'Tarta' },
                { word: 'Música', hint: 'Sonido', fakeWord: 'Canción' },
                { word: 'Regalo', hint: 'Obsequio', fakeWord: 'Sorpresa' },
                { word: 'Globos', hint: 'Decoración', fakeWord: 'Piñata' }
            ];
            if (packageId === 'mock-2') return [
                { word: 'JavaScript', hint: 'Código', fakeWord: 'Python' },
                { word: 'HTML', hint: 'Etiquetas', fakeWord: 'CSS' },
                { word: 'Base de datos', hint: 'Almacenamiento', fakeWord: 'Servidor' },
                { word: 'Servidor', hint: 'Computadora', fakeWord: 'Nube' },
                { word: 'TypeScript', hint: 'Tipos', fakeWord: 'JavaScript' },
                { word: 'Angular', hint: 'Framework', fakeWord: 'React' }
            ];
            if (packageId === 'mock-3') return [
                { word: 'Pizza', hint: 'Masa', fakeWord: 'Lasaña' },
                { word: 'Hamburguesa', hint: 'Carne', fakeWord: 'Sandwich' },
                { word: 'Sushi', hint: 'Pescado', fakeWord: 'Sashimi' },
                { word: 'Tacos', hint: 'Tortilla', fakeWord: 'Burritos' },
                { word: 'Espaguetis', hint: 'Pasta', fakeWord: 'Macarrones' },
                { word: 'Ensalada', hint: 'Vegetales', fakeWord: 'Verduras' }
            ];
            if (packageId === 'mock-4') return [
                { word: 'El Padrino', hint: 'Mafia', fakeWord: 'Scarface' },
                { word: 'Matrix', hint: 'Simulación', fakeWord: 'Terminator' },
                { word: 'Inception', hint: 'Sueños', fakeWord: 'Interstellar' },
                { word: 'Star Wars', hint: 'Espacio', fakeWord: 'Star Trek' },
                { word: 'Titanic', hint: 'Barco', fakeWord: 'Piratas' },
                { word: 'Avatar', hint: 'Alienígenas', fakeWord: 'E.T.' }
            ];
            return [{ word: 'Palabra genérica', hint: 'Pista', fakeWord: 'Falsa' }];
        } finally {
            this.endRequest();
        }
    }
}
