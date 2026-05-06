import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Package, ApiService } from '../../../core/services/api/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { BillingService } from '../../../core/services/billing.service';

import { ButtonPrimaryComponent } from '../../../shared/components/ui/button-primary.component';
import { IconButtonMiniComponent } from '../../../shared/components/ui/icon-button-mini.component';
import { ModalComponent } from '../../../shared/components/ui/modal.component';
import { HeaderComponent } from '../../../shared/components/ui/header.component';
import { FooterComponent } from '../../../shared/components/ui/footer.component';

@Component({
  selector: 'app-setup-packages',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonPrimaryComponent, IconButtonMiniComponent, ModalComponent, HeaderComponent, FooterComponent],
  template: `
  <div class="min-h-dvh flex flex-col bg-transparent text-white">
   
   <!-- HEADER -->
   <app-header [showBack]="true" [title]="'SETUP.PACKAGES' | translate" (onBack)="goBack()"></app-header>
   
   <div class="flex-1 px-6 custom-scrollbar flex flex-col">
   <!-- MODAL DE PALABRAS -->
   <app-modal
     [isOpen]="!!infoModalPackage()"
     [title]="infoModalPackage()?.name || ''"
     (onClose)="closeInfoModal()">
     
     <div modal-icon class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-secondary/50 text-secondary bg-secondary/20 shrink-0">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11v5m0-8h.01" /></svg>
     </div>
     
     <div class="text-textMuted text-sm text-left w-full leading-relaxed">
      @if (isLoadingWords()) {
       <p class="text-center text-textPrimary animate-pulse">{{ 'COMMON.LOADING' | translate }}</p>
      } @else {
       {{ infoModalWords().join(', ') }}
      }
     </div>
     
     <button modal-footer (click)="closeInfoModal()" class="w-full py-4 bg-glass border border-glass-border hover:bg-white/20 text-textPrimary rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 uppercase tracking-widest cursor-pointer">
       {{ 'SETUP.CLOSE' | translate }}
     </button>
   </app-modal>

   <!-- INSTRUCTIONS -->
   <p class="text-center text-textMuted mb-6 shrink-0 text-sm">
    {{ 'SETUP_PACKAGES.INSTRUCTION' | translate }}
   </p>

   <!-- PACKAGES GRID -->
   <div class="flex-1 flex flex-col gap-4 place-content-start">
     
     <!-- Botón para paquete personalizado -->
     <div 
      (click)="goToCustomPackage()"
      class="relative rounded-2xl border-2 border-dashed border-primary cursor-pointer transition-all duration-300 bg-glass backdrop-blur-md flex flex-row items-center p-4 min-h-[8rem] hover:bg-primary/10 hover:border-white/50">
      
      <div class="setup-img-box flex-shrink-0 flex items-center justify-center mr-4 rounded-xl overflow-hidden" style="width: 72px; height: 72px;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8 text-primary">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      
      <div class="flex flex-col flex-1 justify-center">
       <h3 class="font-bold text-lg mb-1 text-textPrimary flex items-center gap-2">
        {{ 'SETUP_PACKAGES.CREATE_CUSTOM' | translate }}
        @if (!billing.isPremium) {
         <span class="text-[0.6rem] bg-gradient-to-r from-primary to-secondary text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">PRO</span>
        }
       </h3>
       <p class="text-sm text-textMuted select-none">
        {{ 'SETUP_PACKAGES.CREATE_CUSTOM_DESC' | translate }}
       </p>
      </div>
     </div>

     <!-- Lista de paquetes de la API -->
     @for (pkg of apiPackages; track pkg.id) {
      <div 
       (click)="togglePackage(pkg.id)"
       class="relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 bg-glass backdrop-blur-md flex flex-row items-center p-4 min-h-[8rem]"
       [ngClass]="isSelected(pkg.id) ? 'border-primary shadow-[0_0_20px_rgb(var(--color-primary)/0.4)]' : 'border-glass-border hover:border-white/20 hover:bg-white/5'">
       
       <!-- Checkmark icon for selected -->
       @if (isSelected(pkg.id)) {
        <div class="absolute top-2 right-2 text-primary bg-glass backdrop-blur border border-primary rounded-full p-0.5 shadow-md z-20">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
         </svg>
        </div>
       }

       <!-- Image placeholder -->
       <div class="setup-img-box flex-shrink-0 flex items-center justify-center mr-4 rounded-xl overflow-hidden" style="width: 72px; height: 72px;">
         <img [src]="getPackageImage(pkg)" [alt]="pkg.name" class="w-full h-full object-cover neon-dynamic-img">
       </div>
       
       <!-- Name and Details -->
       <div class="flex flex-col flex-1 justify-center">
        <h3 class="font-bold text-lg mb-1 text-textPrimary select-none">
         {{ pkg.name }}
        </h3>
        <p class="text-sm text-textMuted select-none">
         {{ pkg.wordCount || 0 }} {{ 'SETUP_PACKAGES.WORDS' | translate }}
        </p>
       </div>

       <!-- Info Button -->
       <app-icon-button-mini (onClick)="openInfoModal(pkg, $event)" class="ml-2">
        <span class="font-serif italic font-black text-lg leading-none">i</span>
       </app-icon-button-mini>
      </div>
     }
   </div>
   
   <!-- FIXED FOOTER -->
   <app-footer>
    <app-button-primary (onClick)="save()">
     {{ 'SETUP.SAVE' | translate }}
    </app-button-primary>
   </app-footer>

  </div>
 `,
  styles: [``]
})
export class SetupPackages {
  apiService = inject(ApiService);
  public themeService = inject(ThemeService);
  public billing = inject(BillingService);
  private router = inject(Router);

  @Input() apiPackages: Package[] = [];

  @Input() set selectedIds(ids: string[]) {
    // Clone array to work locally
    this.localSelectedIds = [...ids];
  }

  @Output() onBack = new EventEmitter<void>();
  @Output() onChange = new EventEmitter<string[]>();

  localSelectedIds: string[] = [];

  infoModalPackage = signal<Package | null>(null);
  infoModalWords = signal<string[]>([]);
  isLoadingWords = signal<boolean>(false);

  goToCustomPackage() {
    if (!this.billing.isPremium) {
      this.router.navigate(['/premium']);
      return;
    }
    this.router.navigate(['/custom-package']);
  }

  async openInfoModal(pkg: Package, event: Event) {
    event.stopPropagation();
    this.infoModalPackage.set(pkg);
    this.isLoadingWords.set(true);
    this.infoModalWords.set([]);

    try {
      const wordsData = await this.apiService.getWordsByPackage(pkg.id);
      this.infoModalWords.set(wordsData.map(w => w.word));
    } catch (error) {
      console.error('Failed to load words', error);
    } finally {
      this.isLoadingWords.set(false);
    }
  }

  closeInfoModal() {
    this.infoModalPackage.set(null);
  }

  isSelected(id: string): boolean {
    return this.localSelectedIds.includes(id);
  }

  togglePackage(id: string) {
    const index = this.localSelectedIds.indexOf(id);
    if (index === -1) {
      this.localSelectedIds.push(id);
    } else {
      this.localSelectedIds.splice(index, 1);
    }
  }

  save() {
    // Only emit when clicking Save
    this.onChange.emit(this.localSelectedIds);
    this.onBack.emit();
  }

  goBack() {
    this.onBack.emit();
  }

  getPackageImage(pkg: Package): string {
    if (pkg.imageId) {
      // Just map directly the ID provided by the seed to the package folder.
      // Cleanest implementation for scaling
      const idMap: Record<string, string> = {
        'fiesta_epica': '/images/packages/fiesta_epica.png',
        'nerd_tecnologia': '/images/packages/nerd_tecnologia.png',
        'comida_deliciosa': '/images/packages/comida_deliciosa.png',
        'peliculas_culto': '/images/packages/peliculas_culto.png',
        'mundo_animal': '/images/packages/mundo_animal.png',
        'manga_anime': '/images/packages/manga_anime.png',
        'bichos': '/images/packages/bichos.png',
        'deportes': '/images/packages/deportes.png',
        'hogar': '/images/packages/hogar.png',
        'videojuegos': '/images/packages/videojuegos.png',
        'paises': '/images/packages/paises.png',
        'musica': '/images/packages/musica.png',
        'profesiones': '/images/packages/profesiones.png',
        'marcas': '/images/packages/marcas.png',
        'fantasia': '/images/packages/fantasia_mitologia.png',
        'celebridades': '/images/packages/celebridades.png',
        'ciencia': '/images/packages/ciencia_espacio.png',
        'superheroes': '/images/packages/superheroes.png'
      };

      let imagePath = idMap[pkg.imageId] || `/images/packages/${pkg.imageId}.png`;
      return this.themeService.getImagePath(imagePath);
    }

    return this.themeService.getImagePath('/images/packages/fiesta_epica.png'); // Fallback
  }
}
