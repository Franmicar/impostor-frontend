import { Injectable, inject, signal, computed, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { UiService } from '../ui/ui.service';

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
    private ui = inject(UiService);
    private apiUrl = isDevMode() ? 'http://localhost:3000/api' : 'https://impostor-backend-eight.vercel.app/api';

    // Signals para state management simple y robusto
    packages = signal<Package[]>([]);
    error = signal<string | null>(null);

    private fetchPackagesPromise: Promise<void> | null = null;
    private wordsCache = new Map<string, { word: string, hint: string, fakeWord: string }[]>();

    /**
     * Silently wakes up the backend and preloads packages without showing the loading screen
     */
    async preloadPackages() {
        if (this.packages().length > 0) return;
        if (!this.fetchPackagesPromise) {
            this.fetchPackagesPromise = this._executeFetchPackages(false);
        }
        try {
            await this.fetchPackagesPromise;
        } catch (e) {
            // Silently fail preload
        }
    }

    async fetchPackages() {
        if (this.packages().length > 0) return;
        
        this.ui.setLoading(true);
        if (!this.fetchPackagesPromise) {
            this.fetchPackagesPromise = this._executeFetchPackages(true);
        }
        try {
            await this.fetchPackagesPromise;
        } catch (e) {
            // Error handled inside
        } finally {
            this.ui.setLoading(false);
        }
    }

    private async _executeFetchPackages(useMocksOnError: boolean): Promise<void> {
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
            if (useMocksOnError) {
                console.warn('Error fetching packages from API, using mock data for UI testing', err);
                this.packages.set([
                    { id: 'mock-1', name: 'Fiesta Épica', description: 'Palabras ideales para la fiesta', wordCount: 50 },
                    { id: 'mock-2', name: 'Nerd de la tecnología', description: 'Términos de programación', wordCount: 120 },
                    { id: 'mock-3', name: 'Comida Deliciosa', description: 'Ingredientes y platos', wordCount: 85 },
                    { id: 'mock-4', name: 'Películas de Culto', description: 'Cine clásico y palomitas', wordCount: 200 }
                ]);
                this.error.set('Modo Local (Sin Backend)');
            } else {
                console.warn('Background preload failed (expected on cold starts)', err);
                throw err;
            }
        } finally {
            this.fetchPackagesPromise = null;
        }
    }

    /**
     * Obtiene la lista de palabras de un paquete especifico
     */
    async getWordsByPackage(packageId: string): Promise<{ word: string, hint: string, fakeWord: string }[]> {
        const currentLang = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'es';
        const cacheKey = `${packageId}_${currentLang}`;
        
        if (this.wordsCache.has(cacheKey)) {
            return this.wordsCache.get(cacheKey)!;
        }

        this.ui.setLoading(true);
        this.error.set(null);
        try {
            const response = await firstValueFrom(
                this.http.get<{ success: boolean, data: { word: string, hint?: string, hints?: string[], fakeWord?: string }[] }>(`${this.apiUrl}/packages/${packageId}/words?lang=${currentLang}`)
            );
            if (response && response.success) {
                const words = response.data.map(w => ({
                    word: w.word,
                    hint: w.hints && w.hints.length > 0 ? w.hints[Math.floor(Math.random() * w.hints.length)] : (w.hint || 'Pista genérica'),
                    fakeWord: w.fakeWord || 'Falsa'
                }));
                this.wordsCache.set(cacheKey, words);
                return words;
            }
            return [];
        } catch (err: any) {
            console.warn('Error fetching words from API, returning mock words', err);
            // Return some mock words based on ID to keep the game flowing if backend is offline
            let mockWords: any[] = [{ word: 'Palabra genérica', hint: 'Pista', fakeWord: 'Falsa' }];
            if (packageId === 'mock-1') mockWords = [
                { word: 'Cerveza', hint: 'Alcohol', fakeWord: 'Vino' },
                { word: 'Confeti', hint: 'Colores', fakeWord: 'Serpentina' },
                { word: 'Pastel', hint: 'Dulce', fakeWord: 'Tarta' },
                { word: 'Música', hint: 'Sonido', fakeWord: 'Canción' },
                { word: 'Regalo', hint: 'Obsequio', fakeWord: 'Sorpresa' },
                { word: 'Globos', hint: 'Decoración', fakeWord: 'Piñata' }
            ];
            else if (packageId === 'mock-2') mockWords = [
                { word: 'JavaScript', hint: 'Código', fakeWord: 'Python' },
                { word: 'HTML', hint: 'Etiquetas', fakeWord: 'CSS' },
                { word: 'Base de datos', hint: 'Almacenamiento', fakeWord: 'Servidor' },
                { word: 'Servidor', hint: 'Computadora', fakeWord: 'Nube' },
                { word: 'TypeScript', hint: 'Tipos', fakeWord: 'JavaScript' },
                { word: 'Angular', hint: 'Framework', fakeWord: 'React' }
            ];
            else if (packageId === 'mock-3') mockWords = [
                { word: 'Pizza', hint: 'Masa', fakeWord: 'Lasaña' },
                { word: 'Hamburguesa', hint: 'Carne', fakeWord: 'Sandwich' },
                { word: 'Sushi', hint: 'Pescado', fakeWord: 'Sashimi' },
                { word: 'Tacos', hint: 'Tortilla', fakeWord: 'Burritos' },
                { word: 'Espaguetis', hint: 'Pasta', fakeWord: 'Macarrones' },
                { word: 'Ensalada', hint: 'Vegetales', fakeWord: 'Verduras' }
            ];
            else if (packageId === 'mock-4') mockWords = [
                { word: 'El Padrino', hint: 'Mafia', fakeWord: 'Scarface' },
                { word: 'Matrix', hint: 'Simulación', fakeWord: 'Terminator' },
                { word: 'Inception', hint: 'Sueños', fakeWord: 'Interstellar' },
                { word: 'Star Wars', hint: 'Espacio', fakeWord: 'Star Trek' },
                { word: 'Titanic', hint: 'Barco', fakeWord: 'Piratas' },
                { word: 'Avatar', hint: 'Alienígenas', fakeWord: 'E.T.' }
            ];
            
            this.wordsCache.set(cacheKey, mockWords);
            return mockWords;
        } finally {
            this.ui.setLoading(false);
        }
    }
}
