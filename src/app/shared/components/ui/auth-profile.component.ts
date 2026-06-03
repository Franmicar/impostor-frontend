import { ChangeDetectionStrategy, Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ProfileService } from '../../../core/services/profile/profile.service';
import { ButtonPrimaryComponent } from './button-primary.component';
import { AvatarComponent } from './avatar.component';

@Component({
  selector: 'app-auth-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, ButtonPrimaryComponent, AvatarComponent],
  template: `
    @if (!authService.isInitialized()) {
      <div [ngClass]="avatarSize()" class="flex items-center justify-center">
        <svg class="animate-spin h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    } @else if (authService.userSignal()) {
      <div class="relative cursor-pointer hover:scale-105 transition-transform flex items-center justify-center select-none"
           (click)="navigateToProfile()"
           [title]="'AUTH_PROFILE.ACCOUNT_OPTIONS' | translate">
        <app-avatar
          [avatarId]="avatarId()"
          [avatarColor]="avatarColor()"
          [avatarFrame]="avatarFrame()"
          [nickname]="nickname()"
          [avatarSize]="avatarSize()"></app-avatar>
      </div>
    } @else if (showLoginButton()) {
      <app-button-primary size="small" (onClick)="navigateToProfile()">
        {{ 'AUTH_PROFILE.LOGIN' | translate }}
      </app-button-primary>
    }
  `
})
export class AuthProfileComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  profileService = inject(ProfileService);
  private router = inject(Router);

  avatarSize = input<string>('w-10 h-10');
  showLoginButton = input<boolean>(true);

  // Compute avatar URL dynamically
  avatarId = computed(() => {
    const profile = this.profileService.profileSignal()?.profile;
    if (profile) {
      if (profile.avatarId && !profile.avatarId.startsWith('/images/default-avatar')) {
        return profile.avatarId;
      }
      return null;
    }
    return this.authService.userSignal()?.photoURL || null;
  });

  // Compute avatar frame dynamic overlay
  avatarFrame = computed(() => {
    const profile = this.profileService.profileSignal()?.profile;
    return profile?.avatarFrame || null;
  });

  // Compute background color for initials fallback
  avatarColor = computed(() => {
    const profile = this.profileService.profileSignal()?.profile;
    return profile?.avatarColor || '#06b6d4';
  });

  // Compute nickname for initials
  nickname = computed(() => {
    const profile = this.profileService.profileSignal()?.profile;
    return profile?.nickname || profile?.firstName || this.authService.userSignal()?.displayName || '?';
  });

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
