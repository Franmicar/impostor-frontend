import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      (click)="onClick.emit()"
      [class.cursor-pointer]="clickable"
      [class.hover:bg-white/5]="clickable"
      [class.active:bg-white/10]="clickable"
      [class.ring-2]="selected"
      [class.ring-primary]="selected"
      class="bg-glass backdrop-blur-md border border-glass-border rounded-2xl flex items-center gap-3 p-5 transition-all">
      
      <!-- Image Left -->
      @if (imageUrl) {
        <img [src]="imageUrl" alt="" class="w-12 h-12 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] neon-dynamic-img">
      }

      <!-- Content Right -->
      <div class="flex flex-col flex-1">
        <!-- Title -->
        <span class="font-semibold text-textPrimary flex items-center gap-2">
          {{ title }}
          <ng-content select="[card-actions]"></ng-content>
        </span>
        <!-- Description -->
        <span class="text-sm font-medium text-textMuted mt-1">
          {{ description }}
        </span>
      </div>

      <!-- Optional Extra Element on Far Right -->
      <ng-content select="[card-right]"></ng-content>

    </div>
  `
})
export class CardComponent {
  @Input() imageUrl?: string;
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() selected = false;
  @Input() clickable = false;
  
  @Output() onClick = new EventEmitter<void>();
}
