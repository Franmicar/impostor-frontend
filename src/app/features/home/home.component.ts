import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-transparent text-slate-50 p-6 relative">
        <div class="absolute top-4 right-4 flex gap-4">
            <button (click)="openRules()" class="w-10 h-10 rounded-full bg-glass border border-glass-border backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-colors active:scale-95 shadow-[0_0_15px_rgba(242,13,185,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </button>
            <button (click)="openSettings()" class="w-10 h-10 rounded-full bg-glass border border-glass-border backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-colors active:scale-95 shadow-[0_0_15px_rgba(242,13,185,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
        </div>

        <div class="flex-1 flex flex-col items-center justify-center w-full max-w-md mt-12">
            <!-- New Character Mask Image -->
            <img src="/images/home_impostor_mask.png" alt="Impostor Mask" class="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-full shadow-[0_0_30px_rgba(13,242,242,0.4)] border-2 border-primary mb-6 animate-pulse" />
            
            <!-- Game Title using Gradient Text Effect -->
            <h1 class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2 drop-shadow-[0_0_20px_rgba(242,13,185,0.4)] text-center tracking-tight">
                {{ 'HOME.TITLE' | translate }}
            </h1>
            
            <p class="text-lg text-slate-300 mb-12 text-center">
                {{ 'HOME.SUBTITLE' | translate }}
            </p>

            <!-- Main Call To Actions -->
            <div class="w-full flex gap-4 px-4 flex-col">
                <button 
                    (click)="startGame()"
                    class="w-full py-4 relative group overflow-hidden bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold text-xl shadow-[0_0_30px_rgba(13,242,242,0.3)] transition-all active:scale-95">
                    <div class="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
                    <span class="relative z-10 drop-shadow-md">{{ 'HOME.PLAY_LOCAL' | translate }}</span>
                </button>
                
                <button 
                    class="w-full py-4 bg-glass border border-glass-border backdrop-blur-md text-slate-400 rounded-2xl font-bold text-xl shadow-lg transition-all cursor-not-allowed items-center justify-center flex flex-col">
                    <span>{{ 'HOME.PLAY_ONLINE' | translate }}</span>
                    <span class="text-xs font-normal opacity-70">{{ 'HOME.COMING_SOON' | translate }}</span>
                </button>
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

  ngOnInit() {
    // Wake up the backend and prefetch packages so Setup screen is instant
    this.apiService.preloadPackages();
  }

  startGame() {
    this.router.navigate(['/setup']);
  }

  openSettings() {
    this.router.navigate(['/settings']);
  }

  openRules() {
    this.router.navigate(['/rules']);
  }
}
