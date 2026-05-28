import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BillingService } from '../../core/services/billing.service';
import { ThemeService } from '../../core/services/theme.service';

import { ButtonSecondaryComponent } from '../../shared/components/ui/button-secondary.component';
import { HeaderComponent } from '../../shared/components/ui/header.component';
import { FooterComponent } from '../../shared/components/ui/footer.component';
import { ModalComponent } from '../../shared/components/ui/modal.component';

@Component({
 selector: 'app-premium',
 standalone: true,
 imports: [CommonModule, TranslateModule, ButtonSecondaryComponent, ModalComponent, HeaderComponent, FooterComponent],
 template: `
  <!-- Fixed Background -->
  <div class="fixed inset-0 z-30" [class]="themeService.currentTheme() === 'infantil' ? 'bg-white' : 'bg-slate-900'">
   <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none"></div>
  </div>

  <!-- Scrolling Content -->
  <div class="fixed inset-0 bg-transparent text-textPrimary flex flex-col custom-scrollbar overflow-y-auto z-40 pb-[160px]">

   <!-- Header -->
   <app-header [showBack]="true" [title]="''" (onBack)="goBack()">
    <div header-extra class="scale-90 origin-right">
     <app-button-secondary (onClick)="restorePurchases()">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
      <span>{{ 'PREMIUM.RESTORE' | translate }}</span>
     </app-button-secondary>
    </div>
   </app-header>

   <!-- Main Content -->
   <div class="flex-1 flex flex-col relative z-10 max-w-md mx-auto w-full px-4">
    <div class="text-center mb-8">
     <div class="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-[0_0_30px_rgb(var(--color-primary)/0.4)] mb-4 animate-pulse-slow">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
       <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
     </div>
     <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-wider mb-2">{{ 'PREMIUM.TITLE' | translate }}</h1>
     <p class="text-textMuted text-sm">{{ 'PREMIUM.SUBTITLE' | translate }}</p>
    </div>

    <!-- Ventajas -->
    <div class="bg-glass backdrop-blur-xl border border-glass-border rounded-3xl p-6 mb-8 shadow-2xl">
     <ul class="space-y-4">
      <li class="flex items-center gap-3">
       <div class="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
       </div>
       <span class="text-sm font-medium text-textPrimary">{{ 'PREMIUM.FEATURE_1' | translate }}</span>
      </li>
      <li class="flex items-center gap-3">
       <div class="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
       </div>
       <span class="text-sm font-medium text-textPrimary">{{ 'PREMIUM.FEATURE_2' | translate }}</span>
      </li>
      <li class="flex items-center gap-3">
       <div class="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
       </div>
       <span class="text-sm font-medium text-textPrimary">{{ 'PREMIUM.FEATURE_3' | translate }}</span>
      </li>
     </ul>
    </div>

    <!-- Planes -->
    <h2 class="text-sm font-bold text-textMuted uppercase tracking-widest mb-4 ml-2">{{ 'PREMIUM.CHOOSE_PLAN' | translate }}</h2>
    
    @if (isLoading()) {
     <div class="flex items-center justify-center p-8">
      <div class="w-8 h-8 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
     </div>
    } @else {
     <div class="space-y-4">
      @for (plan of plans(); track plan.identifier) {
       <div 
        (click)="selectedPlan.set(plan)"
        [class.ring-2]="selectedPlan()?.identifier === plan.identifier"
        [class.ring-primary]="selectedPlan()?.identifier === plan.identifier"
        class="bg-glass border border-glass-border hover:bg-white/10 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all relative overflow-hidden">
        
        @if (plan.packageType === 'ANNUAL') {
         <div class="absolute top-0 right-0 bg-primary text-white text-[0.6rem] font-bold px-2 py-1 rounded-bl-lg">
          {{ 'PREMIUM.BEST_VALUE' | translate }}
         </div>
        }

        <div>
         <h3 class="text-lg font-bold text-textPrimary">{{ 'PREMIUM.PLAN_' + plan.packageType | translate }}</h3>
        </div>
        <div class="text-right">
         <div class="text-xl font-black text-secondary drop-shadow-[0_0_8px_rgb(var(--color-secondary)/0.4)]">{{ plan.product.priceString }}</div>
        </div>
       </div>
      }
     </div>
    }
    
    <!-- EULA & Privacy Policy Links -->
    <div class="flex justify-center gap-4 text-[10px] text-textMuted mt-8 mb-4 px-2 select-none">
     <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" class="hover:underline hover:text-textPrimary transition-colors">{{ 'PREMIUM.EULA' | translate }}</a>
     <span>•</span>
     <a href="https://impostor-backend.vercel.app/api/privacy" target="_blank" class="hover:underline hover:text-textPrimary transition-colors">{{ 'PREMIUM.PRIVACY_POLICY' | translate }}</a>
    </div>
   </div>

   <!-- Footer action -->
   <app-footer>
    <button 
     (click)="purchase()"
     [disabled]="isLoading() || !selectedPlan()"
     class="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold py-4 text-xl shadow-[0_0_30px_rgb(var(--color-primary)/0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto">
     <span class="relative z-10 drop-shadow-md tracking-wider">{{ 'PREMIUM.SUBSCRIBE' | translate }}</span>
    </button>
   </app-footer>

   <!-- ALERTS MODAL NATIVO OMITIDO POR REGLA 4, CREAREMOS UN MODAL PERSONALIZADO AHORA -->
   <!-- ALERTS MODAL -->
   <app-modal
     [isOpen]="alertModal().show"
     [title]="alertModal().title"
     [icon]="alertModal().success ? 'success' : 'error'"
     (onClose)="closeAlert()">
     
     <p class="text-base text-textMuted mb-2 w-full text-center">{{ alertModal().message }}</p>
     
     <button modal-footer (click)="closeAlert()" class="w-full py-4 bg-glass hover:bg-glass-hover border border-glass-border text-textPrimary rounded-xl font-bold transition-all shadow-[0_0_15px_rgb(var(--color-secondary)/0.4)] active:scale-95 uppercase tracking-widest cursor-pointer">
       {{ 'PREMIUM.CLOSE' | translate }}
     </button>
   </app-modal>

   <!-- TOAST DE ÉXITO -->
   @if (showSuccessToast()) {
     <div class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-5 py-3 rounded-full border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)] backdrop-blur-md z-50 flex items-center gap-2 animate-bounce">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4 text-green-500">
         <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
       </svg>
       <span class="text-xs font-semibold tracking-wide">{{ toastMessage() }}</span>
     </div>
   }
  </div>
 `,
 styles: [`
  .animate-pulse-slow {
   animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
 `]
})
export class PremiumComponent implements OnInit {
 private router = inject(Router);
 public billing = inject(BillingService);
 public themeService = inject(ThemeService);
 public translate = inject(TranslateService);
 
 plans = signal<any[]>([]);
 selectedPlan = signal<any | null>(null);
 isLoading = signal(true);
 alertModal = signal({show: false, title: '', message: '', success: false});
 showSuccessToast = signal(false);
 toastMessage = signal('');

 async ngOnInit() {
  this.isLoading.set(true);
  const packages = await this.billing.getOfferings();
  
  // Sort packages: Monthly, Quarterly, Annual
  const sorted = [...packages].sort((a, b) => {
    const order: any = { 'MONTHLY': 1, 'THREE_MONTH': 2, 'ANNUAL': 3 };
    const orderA = order[a.packageType] || 9;
    const orderB = order[b.packageType] || 9;
    return orderA - orderB;
  });

  this.plans.set(sorted);
  
  // Select first by default if any
  if (sorted.length > 0) {
   this.selectedPlan.set(sorted[sorted.length - 1]); // pre-select annual
  }
  
  this.isLoading.set(false);
 }

 async purchase() {
  if (!this.selectedPlan()) return;
  this.isLoading.set(true);
  const success = await this.billing.purchasePremium(this.selectedPlan());
  this.isLoading.set(false);
  
  if (success) {
    this.toastMessage.set(this.translate.instant('PREMIUM.SUCCESS_MSG'));
    this.showSuccessToast.set(true);
    setTimeout(() => {
     this.showSuccessToast.set(false);
     this.goBack();
    }, 3000);
  } else {
   this.alertModal.set({show: true, title: this.translate.instant('PREMIUM.ERROR_TITLE'), message: this.translate.instant('PREMIUM.ERROR_MSG'), success: false});
  }
 }

 async restorePurchases() {
  this.isLoading.set(true);
  const success = await this.billing.restorePurchases();
  this.isLoading.set(false);
  if (success) {
    this.toastMessage.set(this.translate.instant('PREMIUM.RESTORE_MSG'));
    this.showSuccessToast.set(true);
    setTimeout(() => {
     this.showSuccessToast.set(false);
     this.goBack();
    }, 3000);
  } else {
   this.alertModal.set({show: true, title: this.translate.instant('PREMIUM.ERROR_TITLE'), message: this.translate.instant('PREMIUM.RESTORE_ERROR_MSG'), success: false});
  }
 }

 goBack() {
  this.router.navigate(['/']);
 }

 closeAlert() {
  const wasSuccess = this.alertModal().success;
  this.alertModal.set({show: false, title: '', message: '', success: false});
  if (wasSuccess) {
   this.goBack();
  }
 }
}
