import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { BillingService } from '../../../core/services/billing.service';
import { ButtonPrimaryComponent } from '../../../shared/components/ui/button-primary.component';
import { HeaderComponent } from '../../../shared/components/ui/header.component';
import { FooterComponent } from '../../../shared/components/ui/footer.component';

@Component({
  selector: 'app-setup-modes',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonPrimaryComponent, HeaderComponent, FooterComponent],
  template: `
  <div class="h-full flex flex-col bg-transparent text-white">
   <app-header [showBack]="true" [title]="'SETUP_MODES.TITLE' | translate" (onBack)="goBack()"></app-header>

   <div class="flex-1 px-6 flex flex-col gap-4 place-content-start">
    @for (mode of availableModes; track mode.id) {
     <div 
      (click)="selectMode(mode)"
      class="relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 bg-glass backdrop-blur-md flex flex-row items-center p-4 min-h-[8rem]"
      [class.border-primary]="localMode?.id === mode.id"
      [class.shadow-[0_0_20px_rgb(var(--color-primary)/0.4)]]="localMode?.id === mode.id"
      [class.border-glass-border]="localMode?.id !== mode.id">
      
      <!-- Checkmark icon for selected -->
      @if (localMode?.id === mode.id) {
       <div class="absolute top-2 right-2 z-20 text-primary bg-glass backdrop-blur border border-primary rounded-full p-0.5 shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
         <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
        </svg>
       </div>
      }
      
      <!-- Icon/Image based on mode -->
      <div class="setup-img-box flex-shrink-0 flex items-center justify-center mr-4 rounded-xl overflow-hidden" style="width: 72px; height: 72px;">
        <img [src]="themeService.getImagePath('/images/modes/' + mode.id + '.png')" [alt]="mode.name | translate" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 neon-dynamic-img">
      </div>
      
      <div class="flex flex-col flex-1 justify-center">
       <h3 class="font-bold text-lg mb-1 text-textPrimary">{{ mode.name | translate }}</h3>
       <p class="text-sm text-textMuted">{{ mode.description | translate }}</p>
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
export class SetupModes implements OnInit {
  @Input() currentMode!: { id: string; name: string };
  @Output() onBack = new EventEmitter<void>();

  public themeService = inject(ThemeService);
  public billing = inject(BillingService);
  @Output() onChange = new EventEmitter<{ id: string; name: string }>();

  localMode: { id: string; name: string } | null = null;

  ngOnInit() {
    this.localMode = this.currentMode;
  }

  availableModes = [
    {
      id: 'classic',
      name: 'RULES.CLASSIC',
      description: 'RULES.CLASSIC_DESC',
      emoji: '🎭',
      bgClass: 'bg-gradient-to-br from-slate-700 to-slate-600'
    },
    {
      id: 'fast',
      name: 'RULES.FAST',
      description: 'RULES.FAST_DESC',
      emoji: '⏱️',
      bgClass: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      id: 'detective',
      name: 'RULES.DETECTIVE_MODE',
      description: 'RULES.DETECTIVE_MODE_DESC',
      emoji: '🕵️‍♂️',
      bgClass: 'bg-gradient-to-br from-indigo-900 to-slate-800'
    },
    {
      id: 'infiltrator',
      name: 'RULES.INFILTRATOR',
      description: 'RULES.INFILTRATOR_DESC',
      emoji: '🥷',
      bgClass: 'bg-gradient-to-br from-zinc-800 to-black'
    },
    {
      id: 'team',
      name: 'RULES.TEAM',
      description: 'RULES.TEAM_DESC',
      emoji: '🤝',
      bgClass: 'bg-gradient-to-br from-blue-600 to-indigo-600'
    },
    {
      id: 'chaos',
      name: 'RULES.CHAOS',
      description: 'RULES.CHAOS_DESC',
      emoji: '🌪️',
      bgClass: 'bg-gradient-to-br from-rose-600 to-red-800'
    }
  ];

  selectMode(mode: any) {
    this.localMode = { id: mode.id, name: mode.name };
  }

  save() {
    if (this.localMode) {
      this.onChange.emit(this.localMode);
    }
    this.onBack.emit();
  }

  goBack() {
    this.localMode = this.currentMode; // Discard changes
    this.onBack.emit();
  }
}
