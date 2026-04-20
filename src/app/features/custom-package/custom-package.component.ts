import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CustomPackageService, CustomPackage, CustomWord } from '../../core/services/custom-package/custom-package.service';
import { BillingService } from '../../core/services/billing.service';

@Component({
  selector: 'app-custom-package',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="flex flex-col min-h-dvh bg-transparent text-slate-50 p-6">
      <header class="flex items-center mb-6 pt-4 relative">
        <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center rounded-full bg-glass border border-glass-border ...">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <h2 class="text-2xl font-bold text-center flex-1">Paquete Personalizado</h2>
      </header>

      @if (!billing.isPremium) {
        <div class="flex flex-col items-center justify-center p-8 bg-glass rounded-xl text-center">
            <h3 class="text-xl font-bold text-pink-500 mb-2">Requiere Suscripción</h3>
            <p class="text-slate-300">Debes ser usuario Premium para crear y jugar con tus propios paquetes de palabras.</p>
            <button (click)="buyPremium()" class="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-bold shadow-lg">Suscribirse</button>
        </div>
      } @else {
        <div class="bg-glass rounded-xl p-4 mb-4">
            <label class="block text-sm text-slate-400 mb-1">Nombre del paquete</label>
            <input [(ngModel)]="pkgName" placeholder="Ej: Mi Fiesta 2026" class="w-full bg-black/30 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-400" />
        </div>

        <div class="flex-1 overflow-y-auto">
            @for (word of words(); track $index) {
                <div class="bg-black/20 border border-slate-800 rounded-lg p-3 mb-2 flex items-center gap-3">
                    <div class="flex-1">
                        <input [(ngModel)]="word.word" placeholder="Palabra" class="bg-transparent border-b border-slate-700 w-full p-1 mb-1 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" />
                        <input [(ngModel)]="word.fake_word" placeholder="Versión Falsa (opcional)" class="bg-transparent border-b border-slate-700 w-full p-1 text-slate-300 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400" />
                    </div>
                    <button (click)="removeWord($index)" class="text-red-400 p-2 hover:bg-white/5 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                </div>
            }
        </div>

        <div class="mt-4 flex gap-3">
            <button (click)="addWord()" [disabled]="words().length >= 100" class="flex-1 py-3 bg-white/10 rounded-xl font-bold disabled:opacity-50">+ Añadir Palabra</button>
            <button (click)="save()" [disabled]="isSaving()" class="py-3 px-6 bg-cyan-600 rounded-xl font-bold disabled:opacity-50">Guardar</button>
        </div>
      }
    </div>
  `
})
export default class CustomPackageComponent {
  customPackageService = inject(CustomPackageService);
  billing = inject(BillingService);
  router = inject(Router);

  pkgName = 'Mi Paquete';
  words = signal<CustomWord[]>([{ word: '', fake_word: '', hints: [] }]);
  isSaving = signal(false);

  constructor() {
    this.load();
  }

  async load() {
    if (this.billing.isPremium) {
      const data = await this.customPackageService.getMyCustomPackage();
      if (data) {
        this.pkgName = data.name;
        this.words.set(data.words);
      }
    }
  }

  async save() {
    if (this.words().length === 0) return;
    this.isSaving.set(true);
    try {
      await this.customPackageService.saveCustomPackage({
        id: 'custom-main',
        name: this.pkgName,
        words: this.words()
      });
      alert('Guardado con éxito en la nube.');
    } catch (e) {
      alert('Error al guardar.');
    } finally {
      this.isSaving.set(false);
    }
  }

  addWord() {
    if (this.words().length < 100) {
      this.words.update(w => [...w, { word: '', fake_word: '', hints: [] }]);
    }
  }

  removeWord(index: number) {
    this.words.update(w => w.filter((_, i) => i !== index));
  }

  buyPremium() {
    this.billing.purchasePremium();
  }

  goBack() {
    this.router.navigate(['/settings']);
  }
}
