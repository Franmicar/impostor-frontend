import { ChangeDetectionStrategy, Component, input, output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { BillingService } from '../../../core/services/billing.service';
import { ButtonPrimaryComponent } from '../../../shared/components/ui/button-primary.component';
import { HeaderComponent } from '../../../shared/components/ui/header.component';
import { FooterComponent } from '../../../shared/components/ui/footer.component';

@Component({
  selector: 'app-setup-types',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, ButtonPrimaryComponent, HeaderComponent, FooterComponent],
  template: `
  <div class="h-full flex flex-col bg-transparent text-white">
   <app-header [showBack]="true" [title]="'SETUP.GAME_TYPE' | translate" (onBack)="goBack()"></app-header>

   <div class="flex-1 px-6 flex flex-col gap-4 place-content-start">
    @for (type of availableTypes; track type.id) {
     <div 
      (click)="selectType(type)"
      class="relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 bg-glass backdrop-blur-md flex flex-row items-center p-4 min-h-[8rem]"
      [class.border-primary]="localType?.id === type.id"
      [class.shadow-[0_0_20px_rgb(var(--color-primary)/0.4)]]="localType?.id === type.id"
      [class.border-glass-border]="localType?.id !== type.id">
      
      <!-- Checkmark icon for selected -->
      @if (localType?.id === type.id) {
       <div class="absolute top-2 right-2 z-20 text-primary bg-glass backdrop-blur border border-primary rounded-full p-0.5 shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
         <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
        </svg>
       </div>
      }
      
      <!-- Icon based on type -->
      <div class="setup-img-box flex-shrink-0 flex items-center justify-center mr-4 rounded-xl overflow-hidden" style="width: 72px; height: 72px;">
        <img [src]="themeService.resolveAsset('types.' + type.id)" alt="" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 neon-dynamic-img">
      </div>
      
      <div class="flex flex-col flex-1 justify-center">
       <h3 class="font-bold text-lg mb-1 text-textPrimary">{{ type.name | translate }}</h3>
       <p class="text-sm text-textMuted">{{ type.description | translate }}</p>
      </div>
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
  styles: ``,
})
export class SetupTypes implements OnInit {
  currentType = input<{ id: string; name: string }>();
  onBack = output<void>();
  onChange = output<{ id: string; name: string }>();

  public themeService = inject(ThemeService);
  public billing = inject(BillingService);

  localType: { id: string; name: string } | null = null;

  ngOnInit() {
    this.localType = this.currentType() || null;
  }

  availableTypes = [
    {
      id: 'word',
      name: 'RULES.TYPE_WORD',
      description: 'RULES.TYPE_WORD_DESC'
    },
    {
      id: 'question',
      name: 'RULES.TYPE_QUESTION',
      description: 'RULES.TYPE_QUESTION_DESC'
    },
    {
      id: 'draw',
      name: 'RULES.TYPE_DRAW',
      description: 'RULES.TYPE_DRAW_DESC'
    }
  ];

  selectType(type: any) {
    this.localType = { id: type.id, name: type.name };
  }

  save() {
    if (this.localType) {
      this.onChange.emit(this.localType);
    }
    this.onBack.emit();
  }

  goBack() {
    this.localType = this.currentType() || null; // Discard changes
    this.onBack.emit();
  }
}
