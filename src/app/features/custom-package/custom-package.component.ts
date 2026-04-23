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
  <div class="flex flex-col min-h-dvh bg-transparent text-textPrimary p-6">
   <header class="flex items-center justify-between mb-6 relative">
    <button (click)="goBack()" class="w-10 h-10 rounded-full bg-glass border border-glass-border backdrop-blur-md flex flex-shrink-0 items-center justify-center text-textMuted hover:text-white transition-colors active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer z-10">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
    </button>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
     <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgb(var(--color-primary)/0.4)] text-center tracking-wider">Paquete personalizado</h2>
    </div>
    <div class="w-10"></div>
   </header>

   @if (!billing.isPremium) {
    <div class="flex flex-col items-center justify-center p-8 bg-glass rounded-xl text-center">
      <h3 class="text-xl font-bold text-pink-500 mb-2">Requiere Suscripción</h3>
      <p class="text-textMuted">Debes ser usuario Premium para crear y jugar con tus propios paquetes de palabras.</p>
      <button (click)="buyPremium()" class="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-bold shadow-lg">Suscribirse</button>
    </div>
   } @else {
    <div class="bg-glass rounded-xl p-4 mb-4 border border-glass-border">
      <label class="block text-sm font-bold text-textMuted mb-2 uppercase tracking-wider">Nombre del paquete</label>
      <input [(ngModel)]="pkgName" placeholder="Ej: Mi Fiesta 2026" class="w-full bg-black/30 border border-glass-border rounded-lg p-3 text-textPrimary outline-none focus:border-primary transition-colors" />
    </div>

    <div class="flex-1 overflow-y-auto pb-6">
      @for (word of words(); track $index) {
        <div class="bg-glass border border-glass-border rounded-2xl p-4 mb-4 flex flex-col gap-3 relative shadow-lg">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">{{ $index + 1 }}</span>
              Palabra
            </span>
            <button (click)="removeWord($index)" class="text-textMuted hover:text-red-400 p-1.5 rounded-full transition-colors bg-white/5 hover:bg-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
          </div>
          
          <div class="relative">
            <input [(ngModel)]="word.word" placeholder="Palabra principal (ej: Gato)" class="bg-black/30 border border-glass-border rounded-xl w-full p-3.5 text-textPrimary outline-none placeholder:text-textMuted focus:border-primary transition-colors font-medium" />
          </div>
          
          <div class="relative">
            <input [(ngModel)]="word.fake_word" placeholder="Palabra falsa (ej: Perro)" class="bg-black/30 border border-glass-border rounded-xl w-full p-3.5 text-textPrimary outline-none placeholder:text-textMuted focus:border-secondary transition-colors font-medium" />
          </div>
          
          <div class="relative">
            <input #hintInput [value]="word.hints.join(', ')" (change)="updateHints($index, hintInput.value)" placeholder="Pistas separadas por coma (ej: Miau, Bigotes)" class="bg-black/30 border border-glass-border rounded-xl w-full p-3.5 text-textMuted text-sm outline-none placeholder:text-textMuted/50 focus:border-primary transition-colors" />
          </div>
        </div>
      }
    </div>

    <!-- FOOTER ACTIONS -->
    <div class="fixed bottom-0 left-0 right-0 p-6 bg-slate-900/80 backdrop-blur-md border-t border-slate-700/50 z-50 flex flex-row gap-4">
      <button (click)="addWord()" [disabled]="words().length >= 100" class="flex-1 relative py-4 bg-glass hover:bg-white/20 border border-glass-border text-textPrimary rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur disabled:opacity-50">
        + Añadir Palabra
      </button>
      <button (click)="save()" [disabled]="isSaving() || !isValid()" class="flex-1 relative group overflow-hidden bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold py-4 text-xl shadow-[0_0_30px_rgb(var(--color-primary)/0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
        <div class="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
        <span class="relative z-10 drop-shadow-md tracking-wider">Guardar</span>
      </button>
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

 updateHints(index: number, value: string) {
  const hintsArray = value.split(',').map(h => h.trim()).filter(h => h.length > 0);
  this.words.update(w => {
   const newWords = [...w];
   newWords[index].hints = hintsArray;
   return newWords;
  });
 }

 isValid(): boolean {
  if (!this.pkgName || this.pkgName.trim().length === 0) return false;
  if (this.words().length === 0) return false;
  
  return this.words().every(w => 
   w.word && w.word.trim().length > 0 && 
   w.fake_word && w.fake_word.trim().length > 0
  );
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
