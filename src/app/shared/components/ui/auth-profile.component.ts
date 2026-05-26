import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ButtonPrimaryComponent } from './button-primary.component';

@Component({
  selector: 'app-auth-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, ButtonPrimaryComponent],
  template: `
    @if (authService.userSignal()) {
      <img [src]="authService.userSignal()?.photoURL || themeService.resolveAsset('shared.default_avatar')" 
           referrerpolicy="no-referrer" 
           [class]="avatarSize() + ' rounded-full border-2 border-secondary shadow-[0_0_10px_rgb(var(--color-secondary)/0.4)] cursor-pointer hover:scale-105 transition-transform'" 
           (click)="navigateToProfile()" 
           [title]="'AUTH_PROFILE.ACCOUNT_OPTIONS' | translate" />
    } @else if (showLoginButton()) {
      <app-button-primary size="small" (onClick)="authService.loginWithGoogle()">
        {{ 'AUTH_PROFILE.LOGIN' | translate }}
      </app-button-primary>
    }
  `
})
export class AuthProfileComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  avatarSize = input<string>('w-10 h-10');
  showLoginButton = input<boolean>(true);

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
