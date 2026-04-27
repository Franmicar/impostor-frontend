import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { IconButtonComponent } from '../../../shared/components/ui/icon-button.component';
import { TextHeaderComponent } from '../../../shared/components/ui/text-header.component';
import { ButtonPrimaryComponent } from '../../../shared/components/ui/button-primary.component';

@Component({
  selector: 'app-setup-types',
  standalone: true,
  imports: [CommonModule, TranslateModule, IconButtonComponent, TextHeaderComponent, ButtonPrimaryComponent],
  template: `
  <div class="h-full flex flex-col bg-transparent text-white p-6">
   <header class="flex items-center justify-between mb-8 shrink-0">
    <app-icon-button (onClick)="goBack()">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
     </svg>
    </app-icon-button>
    <app-text-header>{{ 'SETUP.GAME_TYPE' | translate }}</app-text-header>
    <div class="w-10 h-10 invisible shrink-0"></div> <!-- Spacer -->
   </header>

   <div class="flex-1 overflow-y-auto pb-32 flex flex-col gap-4 place-content-start">
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
        <img [src]="themeService.getImagePath('/images/types/' + type.id + '.png')" alt="" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 neon-dynamic-img">
      </div>
      
      <div class="flex flex-col flex-1 justify-center">
       <h3 class="font-bold text-lg mb-1 text-textPrimary">{{ type.name | translate }}</h3>
       <p class="text-sm text-textMuted">{{ type.description | translate }}</p>
      </div>
     </div>
    }
   </div>
   
   <!-- FIXED FOOTER -->
   <footer class="fixed bottom-0 left-0 right-0 p-6 pb-[96px] bg-[var(--app-bg-to)] border-t border-glass-border z-50">
    <app-button-primary (onClick)="save()">
     {{ 'SETUP.SAVE' | translate }}
    </app-button-primary>
   </footer>

  </div>
 `,
  styles: ``,
})
export class SetupTypes implements OnInit {
  @Input() currentType!: { id: string; name: string };
  @Output() onBack = new EventEmitter<void>();
  @Output() onChange = new EventEmitter<{ id: string; name: string }>();

  public themeService = inject(ThemeService);

  localType: { id: string; name: string } | null = null;

  ngOnInit() {
    this.localType = this.currentType;
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
    this.localType = this.currentType; // Discard changes
    this.onBack.emit();
  }
}
