import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService } from '../../../core/services/billing.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
   <footer class="fixed bottom-0 left-0 right-0 z-40 w-full">
    <!-- Fondo degradado que cubre también el espacio del banner -->
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent -z-10 w-full h-full pointer-events-none"></div>
    
    <!-- Botones de Acción -->
    <div class="px-4 pb-4">
      <div class="flex items-center justify-center gap-4 mx-auto w-full *:w-full *:flex-1">
        <ng-content></ng-content>
      </div>
    </div>

    <!-- Espacio reservado para el banner nativo de AdMob -->
    @if (!billing.isPremium) {
      <div class="w-full h-[70px] sm:h-[90px]"></div>
    } @else {
      <!-- Pequeño margen si es premium para que no quede pegado al ras -->
      <div class="w-full h-[15px]"></div>
    }
   </footer>
  `
})
export class FooterComponent {
  billing = inject(BillingService);
}
