import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService } from '../../../core/services/billing.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
   <footer class="fixed bottom-0 left-0 right-0 z-40 px-4 w-full" 
           [ngClass]="billing.isPremium ? 'pb-8' : 'pb-[5.5rem]'">
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent -z-10 w-full h-full pointer-events-none"></div>
    <div class="flex items-center justify-center gap-4 mx-auto w-full *:w-full *:flex-1">
      <ng-content></ng-content>
    </div>
   </footer>
  `
})
export class FooterComponent {
  billing = inject(BillingService);
}
