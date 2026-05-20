import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api/api.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { BillingService } from '../../core/services/billing.service';
import { GameEngineService } from '../../core/services/game-engine/game-engine';

import { IconButtonComponent } from '../../shared/components/ui/icon-button.component';
import { ButtonPrimaryComponent } from '../../shared/components/ui/button-primary.component';
import { AuthProfileComponent } from '../../shared/components/ui/auth-profile.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, IconButtonComponent, ButtonPrimaryComponent, AuthProfileComponent],
  template: `
    <div class="flex flex-col items-center min-h-dvh bg-transparent text-textPrimary px-6 relative overflow-y-auto">
        
        <div class="absolute top-4 right-4 flex gap-4 z-50 items-center">            <!-- Premium Button -->
            <button (click)="openPremium()" class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white hover:opacity-90 transition-all active:scale-95 shadow-[0_0_15px_rgb(var(--color-primary)/0.4)] animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </button>
            <app-icon-button (onClick)="openRules()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </app-icon-button>
            <app-icon-button (onClick)="openSettings()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </app-icon-button>

            <!-- Auth Profile / Login -->
            <app-auth-profile avatarSize="w-10 h-10"></app-auth-profile>
        </div>

        <div class="w-full max-w-md my-auto pt-24 pb-8 flex flex-col items-center">
            <!-- New Character Mask Image -->
            <img [src]="themeService.getImagePath('/images/home_impostor_mask.png')" alt="Impostor Mask" class="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-full shadow-[0_0_30px_rgb(var(--color-secondary)/0.4)] border-2 border-primary mb-6 animate-pulse neon-dynamic-img" />
            
            <!-- Game Title using Gradient Text Effect -->
            <h1 class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2 drop-shadow-[0_0_20px_rgb(var(--color-primary)/0.4)] text-center tracking-tight pb-4">
                {{ 'HOME.TITLE' | translate }}
            </h1>
            
            <p class="text-lg text-textMuted mb-12 text-center">
                {{ 'HOME.SUBTITLE' | translate }}
            </p>

            <!-- Main Call To Actions -->
            <div class="w-full flex gap-4 px-4 flex-col">
                <app-button-primary (onClick)="startGame()">
                    {{ 'HOME.PLAY_LOCAL' | translate }}
                </app-button-primary>
                
                <app-button-primary (onClick)="playOnline()">
                    {{ 'HOME.PLAY_ONLINE' | translate }}
                </app-button-primary>
            </div>
        </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  public themeService = inject(ThemeService);
  public authService = inject(AuthService);
  public billing = inject(BillingService);
  private gameEngine = inject(GameEngineService);

  ngOnInit() {
    // Wake up the backend and prefetch packages so Setup screen is instant
    this.apiService.preloadPackages();
  }

  startGame() {
    this.gameEngine.isOnline.set(false);
    this.router.navigate(['/setup']);
  }

  playOnline() {
    this.gameEngine.isOnline.set(true);
    this.router.navigate(['/setup']);
  }

  openSettings() {
    this.router.navigate(['/settings']);
  }

  openRules() {
    this.router.navigate(['/rules']);
  }

  openPremium() {
    this.router.navigate(['/premium']);
  }
}
