import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BillingService } from '../../core/services/billing.service';
import { IconButtonComponent } from '../../shared/components/ui/icon-button.component';
import { ButtonSecondaryComponent } from '../../shared/components/ui/button-secondary.component';
import { ModalComponent } from '../../shared/components/ui/modal.component';

@Component({
 selector: 'app-premium',
 standalone: true,
 imports: [CommonModule, TranslateModule, IconButtonComponent, ButtonSecondaryComponent, ModalComponent],
 template: `
  <div class="min-h-dvh bg-transparent text-textPrimary flex flex-col pt-6 px-4 pb-[80px] overflow-y-auto custom-scrollbar relative">
   <!-- Decoración de fondo extra para Premium -->
   <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none"></div>

   <!-- Header -->
   <header class="flex items-center justify-between mb-6 relative z-10">
    <app-icon-button (onClick)="goBack()">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
     </svg>
    </app-icon-button>
    <div class="scale-90 origin-right">
     <app-button-secondary (onClick)="restorePurchases()">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
      <span>Restaurar</span>
     </app-button-secondary>
    </div>
   </header>

   <!-- Main Content -->
   <div class="flex-1 flex flex-col relative z-10 max-w-md mx-auto w-full">
    <div class="text-center mb-8">
     <div class="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-[0_0_30px_rgb(var(--color-primary)/0.4)] mb-4 animate-pulse-slow">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
       <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
     </div>
     <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-wider mb-2">DECEPTRA PRO</h1>
     <p class="text-textMuted text-sm">Desbloquea todo el potencial del juego.</p>
    </div>

    <!-- Ventajas -->
    <div class="bg-glass backdrop-blur-xl border border-glass-border rounded-3xl p-6 mb-8 shadow-2xl">
     <ul class="space-y-4">
      <li class="flex items-center gap-3">
       <div class="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
       </div>
       <span class="text-sm font-medium text-textPrimary">Experiencia libre de anuncios</span>
      </li>
      <li class="flex items-center gap-3">
       <div class="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
       </div>
       <span class="text-sm font-medium text-textPrimary">Regalo Exclusivo: Tema "Neón 2" con colores variables Amarillos y Verdes.</span>
      </li>
      <li class="flex items-center gap-3">
       <div class="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-secondary"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
       </div>
       <span class="text-sm font-medium text-textPrimary">Acceso ilimitado a crear Paquetes Personalizados</span>
      </li>
     </ul>
    </div>

    <!-- Planes -->
    <h2 class="text-sm font-bold text-textMuted uppercase tracking-widest mb-4 ml-2">Elige tu plan</h2>
    
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
        class="bg-white/5 border border-glass-border hover:bg-white/10 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all relative overflow-hidden">
        
        @if (plan.packageType === 'ANNUAL') {
         <div class="absolute top-0 right-0 bg-primary text-white text-[0.6rem] font-bold px-2 py-1 rounded-bl-lg">
          MEJOR VALOR
         </div>
        }

        <div>
         <h3 class="text-lg font-bold text-white">{{ plan.product.title }}</h3>
        </div>
        <div class="text-right">
         <div class="text-xl font-black text-secondary drop-shadow-[0_0_8px_rgb(var(--color-secondary)/0.4)]">{{ plan.product.priceString }}</div>
        </div>
       </div>
      }
     </div>
    }
   </div>

   <!-- Footer action -->
   <div class="fixed bottom-0 left-0 right-0 p-6 pb-[76px] z-50">
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent -z-10 pointer-events-none"></div>
    <button 
     (click)="purchase()"
     [disabled]="isLoading() || !selectedPlan()"
     class="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold py-4 text-xl shadow-[0_0_30px_rgb(var(--color-primary)/0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 max-w-md mx-auto">
     <span class="relative z-10 drop-shadow-md tracking-wider">SUSCRIBIRSE</span>
    </button>
   </div>

   <!-- ALERTS MODAL NATIVO OMITIDO POR REGLA 4, CREAREMOS UN MODAL PERSONALIZADO AHORA -->
   <!-- ALERTS MODAL -->
   <app-modal
     [isOpen]="alertModal().show"
     [title]="alertModal().title"
     [icon]="alertModal().success ? 'success' : 'error'"
     (onClose)="closeAlert()">
     
     <p class="text-base text-textMuted mb-2 w-full text-center">{{ alertModal().message }}</p>
     
     <button modal-footer (click)="closeAlert()" class="w-full py-4 bg-white/10 hover:bg-white/20 border border-glass-border text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 uppercase tracking-widest">
       Cerrar
     </button>
   </app-modal>
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
 
 plans = signal<any[]>([]);
 selectedPlan = signal<any | null>(null);
 isLoading = signal(true);
 alertModal = signal({show: false, title: '', message: '', success: false});

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
   this.alertModal.set({show: true, title: '¡Suscripción Activada!', message: 'Gracias por tu compra. Ya eres PRO.', success: true});
  } else {
   this.alertModal.set({show: true, title: 'Error', message: 'No se pudo completar la compra.', success: false});
  }
 }

 async restorePurchases() {
  this.isLoading.set(true);
  const success = await this.billing.restorePurchases();
  this.isLoading.set(false);
  if (success) {
   this.alertModal.set({show: true, title: 'Restaurado', message: 'Tus compras han sido restauradas.', success: true});
  } else {
   this.alertModal.set({show: true, title: 'Error', message: 'No se encontraron compras activas.', success: false});
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
