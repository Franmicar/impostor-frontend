import { ChangeDetectionStrategy, Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div [class]="avatarSize() + ' relative overflow-visible flex items-center justify-center select-none'">
      <!-- Avatar Image or Initials Fallback -->
      <div class="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
        @if (avatarUrl()) {
          <img [src]="avatarUrl()" 
               referrerpolicy="no-referrer" 
               [class]="'w-full h-full object-cover ' + borderClass() + ' ' + shadowClass()" />
        } @else {
          <!-- Fallback: Inicial de apodo con color de fondo dinámico -->
          <div [style.background]="avatarColor()" 
               [class]="'w-full h-full rounded-full flex items-center justify-center text-white font-black ' + borderClass() + ' ' + shadowClass() + ' ' + textSizeClass()">
            {{ initials() }}
          </div>
        }
      </div>

      <!-- Frame Overlay if any (Uses dynamic scale to fit the avatar perfectly) -->
      @if (frameUrl()) {
        <img [src]="frameUrl()" 
             class="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
             [style.transform]="frameScale()" />
      }
    </div>
  `
})
export class AvatarComponent {
  private themeService = inject(ThemeService);

  avatarId = input<string | null | undefined>(null);
  avatarColor = input<string>('#06b6d4');
  avatarFrame = input<string | null | undefined>(null);
  nickname = input<string>('');
  avatarSize = input<string>('w-10 h-10');
  borderClass = input<string>('');
  shadowClass = input<string>('shadow-[0_0_10px_rgb(var(--color-secondary)/0.4)]');

  // Compute avatar URL dynamically
  avatarUrl = computed(() => {
    const id = this.avatarId();
    if (id && !id.startsWith('/images/default-avatar')) {
      return id;
    }
    return null;
  });

  // Compute frame URL dynamically
  frameUrl = computed(() => {
    const frame = this.avatarFrame();
    if (!frame) {
      return null;
    }
    return this.themeService.getFrameAsset(frame);
  });

  // Compute initials fallback
  initials = computed(() => {
    const name = this.nickname() || '?';
    return name.charAt(0).toUpperCase();
  });

  // Compute text size class based on button dimensions
  textSizeClass = computed(() => {
    const size = this.avatarSize();
    if (size.includes('w-8')) return 'text-sm';
    if (size.includes('w-12')) return 'text-xl';
    if (size.includes('w-16') || size.includes('w-20') || size.includes('w-24')) return 'text-3xl';
    return 'text-lg';
  });

  // Compute theme-specific scale factor to align the frame tightly without clipping or squishing
  frameScale = computed(() => {
    const frame = this.avatarFrame();
    if (!frame) return 'scale(1)';
    // Neon: starts at 60% radius in the V8 processed PNG, scaled by 1.33 -> inner circle fits perfectly (79.8% of container)
    // while outer lightning bolts expand beautifully outwards
    if (frame === 'neon' || frame === 'neon2') {
      return 'scale(1.33)';
    }
    // Other themes scale factors (will be updated when they are generated)
    if (frame === 'infantil') return 'scale(1.20)';
    if (frame === 'alien') return 'scale(1.28)';
    if (frame === 'manga') return 'scale(1.28)';
    return 'scale(1.12)';
  });
}
