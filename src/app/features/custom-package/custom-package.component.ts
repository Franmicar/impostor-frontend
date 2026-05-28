import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CustomPackageService, CustomPackage, CustomWord } from '../../core/services/custom-package/custom-package.service';
import { BillingService } from '../../core/services/billing.service';

import { HeaderComponent } from '../../shared/components/ui/header.component';
import { FooterComponent } from '../../shared/components/ui/footer.component';
import { ButtonPrimaryComponent } from '../../shared/components/ui/button-primary.component';
import { ButtonSecondaryComponent } from '../../shared/components/ui/button-secondary.component';
import { ModalComponent } from '../../shared/components/ui/modal.component';

@Component({
 selector: 'app-custom-package',
 standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule, HeaderComponent, FooterComponent, ButtonPrimaryComponent, ButtonSecondaryComponent, ModalComponent],
 template: `
  <div class="flex flex-col min-h-dvh bg-transparent text-textPrimary">
   <app-header [showBack]="true" [title]="'CUSTOM_PACKAGE.TITLE' | translate" (onBack)="goBack()"></app-header>
   <div class="flex-1 px-6 flex flex-col">
   @if (!billing.isPremium) {
    <div class="flex flex-col items-center justify-center p-8 bg-glass rounded-xl text-center">
      <h3 class="text-xl font-bold text-pink-500 mb-2">{{ 'CUSTOM_PACKAGE.REQ_SUBSCRIPTION_TITLE' | translate }}</h3>
      <p class="text-textMuted">{{ 'CUSTOM_PACKAGE.REQ_SUBSCRIPTION_DESC' | translate }}</p>
      <button (click)="buyPremium()" class="mt-4 px-3 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-bold shadow-lg">{{ 'PREMIUM.SUBSCRIBE' | translate }}</button>
    </div>
   } @else {
    <div class="bg-glass rounded-xl p-4 mb-4 border border-glass-border">
      <label class="block text-sm font-bold text-textMuted mb-2 uppercase tracking-wider">{{ 'CUSTOM_PACKAGE.PACKAGE_NAME' | translate }}</label>
      <input [(ngModel)]="pkgName" [placeholder]="'CUSTOM_PACKAGE.PKG_NAME_PLACEHOLDER' | translate" class="w-full bg-black/30 border border-glass-border rounded-lg p-3 text-textPrimary outline-none focus:border-primary transition-colors" />
    </div>

    <div class="flex-1">
      @for (word of words(); track $index) {
        <div class="bg-glass border border-glass-border rounded-2xl p-4 mb-4 flex flex-col gap-3 relative shadow-lg">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">{{ $index + 1 }}</span>
              {{ 'CUSTOM_PACKAGE.WORD' | translate }}
            </span>
            <button (click)="removeWord($index)" class="text-textMuted hover:text-red-400 p-1.5 rounded-full transition-colors bg-white/5 hover:bg-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
          </div>
          
          <div class="relative">
            <input [(ngModel)]="word.word" minlength="2" maxlength="30" [placeholder]="'CUSTOM_PACKAGE.WORD_PLACEHOLDER' | translate" class="bg-black/30 border border-glass-border rounded-xl w-full p-3.5 text-textPrimary outline-none placeholder:text-textMuted focus:border-primary transition-colors font-medium" />
          </div>
          
          <div class="relative">
            <input [(ngModel)]="word.fake_word" minlength="2" maxlength="30" [placeholder]="'CUSTOM_PACKAGE.FAKE_WORD_PLACEHOLDER' | translate" class="bg-black/30 border border-glass-border rounded-xl w-full p-3.5 text-textPrimary outline-none placeholder:text-textMuted focus:border-secondary transition-colors font-medium" />
          </div>
          
          <div class="relative">
            <input #hintInput [value]="word.hints.join(', ')" (change)="updateHints($index, hintInput.value)" [placeholder]="'CUSTOM_PACKAGE.HINTS_PLACEHOLDER' | translate" class="bg-black/30 border border-glass-border rounded-xl w-full p-3.5 text-textMuted text-sm outline-none placeholder:text-textMuted/50 focus:border-primary transition-colors" />
          </div>
        </div>
      }
    </div>

    <!-- FOOTER ACTIONS -->
    <app-footer>
      <div class="flex-1">
       <app-button-secondary (onClick)="addWord()" [disabled]="words().length >= 100">
         {{ 'CUSTOM_PACKAGE.ADD_WORD' | translate }}
       </app-button-secondary>
      </div>
      <div class="flex-1">
       <app-button-primary (onClick)="save()" [disabled]="isSaving() || !isValid()">
         {{ isSaving() ? ('CUSTOM_PACKAGE.SAVING' | translate) : ('CUSTOM_PACKAGE.SAVE' | translate) }}
       </app-button-primary>
      </div>
     </app-footer>
   }
   </div>

    <!-- MODAL DE GUARDADO -->
    <app-modal
      [isOpen]="showSaveModal()"
      [title]="saveModalSuccess() ? ('ALERTS.TITLE_SUCCESS' | translate) : ('ALERTS.TITLE_ERROR' | translate)"
      [icon]="saveModalSuccess() ? 'success' : 'error'"
      (onClose)="showSaveModal.set(false)">
      
      <p class="text-base text-textMuted mb-4 w-full text-center">
       {{ saveModalSuccess() ? ('CUSTOM_PACKAGE.SAVE_SUCCESS' | translate) : ('CUSTOM_PACKAGE.SAVE_ERROR' | translate) }}
      </p>
      
      <div modal-footer class="flex gap-3 w-full">
       <button 
        (click)="showSaveModal.set(false)"
        class="flex-1 py-4 rounded-xl border border-glass-border text-textMuted font-semibold hover:bg-white/5 transition-colors uppercase tracking-widest text-sm cursor-pointer">
        {{ 'CUSTOM_PACKAGE.CONTINUE_EDITING' | translate }}
       </button>
       <button 
        (click)="goBack()"
        class="flex-1 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-[0_0_15px_rgba(var(--color-primary),0.4)] transition-colors uppercase tracking-widest text-sm cursor-pointer">
        {{ 'SETUP.CLOSE' | translate }}
       </button>
      </div>
    </app-modal>

  </div>
 `
})
export default class CustomPackageComponent {
 customPackageService = inject(CustomPackageService);
 billing = inject(BillingService);
 router = inject(Router);
 translate = inject(TranslateService);

 pkgName = 'Mi Paquete';
 words = signal<CustomWord[]>([{ word: '', fake_word: '', hints: [] }]);
 isSaving = signal(false);
 showSaveModal = signal(false);
 saveModalSuccess = signal(true);

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
   this.saveModalSuccess.set(true);
   this.showSaveModal.set(true);
  } catch (e) {
   this.saveModalSuccess.set(false);
   this.showSaveModal.set(true);
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
   w.word && w.word.trim().length >= 2 && w.word.trim().length <= 30 && 
   w.fake_word && w.fake_word.trim().length >= 2 && w.fake_word.trim().length <= 30
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
