import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameEngineService } from '../../core/services/game-engine/game-engine';
import { AdsService } from '../../core/services/ads.service';
import { ThemeService } from '../../core/services/theme.service';
import { BillingService } from '../../core/services/billing.service';
import { UiService } from '../../core/services/ui/ui.service';
import { ButtonPrimaryComponent } from '../../shared/components/ui/button-primary.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonPrimaryComponent],
  template: `
  <!-- Fixed Background -->
  <div class="fixed inset-0 z-30" [ngClass]="backgroundClass()"></div>

  <!-- Scrolling Content -->
  <div class="fixed inset-0 flex flex-col items-center px-6 text-textPrimary overflow-y-auto z-40 pb-[80px]">
   
   <!-- Confetti or dynamic background could go here -->
   
   <div class="bg-glass p-8 rounded-3xl backdrop-blur-2xl border border-glass-border text-center max-w-sm w-full z-10 shadow-[0_0_30px_rgba(255,255,255,0.1)] my-auto py-8">
    <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-wider sm:tracking-widest mb-2 leading-tight" [ngClass]="textClass()">
     {{ title() | translate }}
    </h1>
    
    <div class="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 mt-4">
    @if (winner === 'impostors') {
     @if (reason === 'time') {
      <p class="text-textMuted text-lg">{{ 'RESULTS.REASON_TIME' | translate }}</p>
     } @else if (reason === 'guess') {
      <p class="text-textMuted text-lg" [innerHTML]="'RESULTS.REASON_GUESS_FAIL' | translate: { name: '<span class=\\'font-bold text-indigo-400\\'>' + detectiveName + '</span>', guess: guess }"></p>
     } @else if (engine.currentSettings()?.modeId === 'fast') {
      <p class="text-textMuted text-lg">{{ 'RESULTS.REASON_FAST_FAIL' | translate }}</p>
     } @else {
      <p class="text-textMuted text-lg">{{ 'RESULTS.REASON_IMP_WIN' | translate }}</p>
     }
    } @else if (winner === 'town') {
     @if (reason === 'guess') {
       <p class="text-textMuted text-lg" [innerHTML]="'RESULTS.REASON_GUESS_WIN' | translate: { name: '<span class=\\'font-bold text-indigo-400\\'>' + detectiveName + '</span>', guess: guess }"></p>
     } @else {
       <p class="text-textMuted text-lg">{{ 'RESULTS.REASON_CIVILS_WIN' | translate }}</p>
     }
    } @else {
     <p class="text-textMuted text-lg">{{ 'RESULTS.NO_CLEAR_WIN' | translate }}</p>
    }
   </div>

    <div class="mb-8">
     <p class="text-sm text-textMuted uppercase tracking-widest mb-1 font-bold">{{ 'RESULTS.SECRET_WORD' | translate }}</p>
     <div class="bg-glass backdrop-blur border border-glass-border px-6 py-3 rounded-xl inline-block shadow-inner">
      <span class="text-3xl font-black font-mono text-textPrimary drop-shadow-md">{{ engine.secretWord()?.word || '???' }}</span>
     </div>
    </div>

    <div class="mb-8 items-center flex flex-col">
     <p class="text-sm text-textMuted uppercase tracking-widest mb-3 font-bold">{{ 'RESULTS.ROUND_IMPOSTORS' | translate }}</p>
     <div class="flex flex-wrap justify-center gap-2">
      @for (imp of impostors; track imp.id) {
       <span class="bg-primary/20 backdrop-blur text-primary font-bold px-4 py-2 rounded-lg border border-primary/50 shadow-[0_0_10px_rgb(var(--color-primary)/0.4)]">
        {{ imp.name }}
       </span>
      }
     </div>
    </div>

    @if (winner === 'town') {
     <div class="mb-8 items-center flex flex-col">
      @if (reason === 'guess') {
       <p class="text-sm text-indigo-400 font-bold uppercase tracking-widest mb-3 drop-shadow-sm">{{ 'RESULTS.WIN_DETS_TITLE' | translate }}</p>
       <div class="flex flex-wrap justify-center gap-2">
        @for (det of detectives; track det.id) {
         <span class="bg-indigo-500/20 backdrop-blur text-indigo-400 font-bold px-4 py-2 rounded-lg border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
          {{ det.name }}
         </span>
        }
       </div>
      } @else {
       <p class="text-sm text-textMuted font-bold uppercase tracking-widest mb-3">{{ 'RESULTS.WIN_CIVS_TITLE' | translate }}</p>
       <div class="flex flex-wrap justify-center gap-2 mb-3">
        @for (civ of survivingCivilians; track civ.id) {
         <span class="bg-secondary/20 backdrop-blur text-secondary font-bold px-4 py-2 rounded-lg border border-secondary/50 shadow-[0_0_10px_rgb(var(--color-secondary)/0.4)]">
          {{ civ.name }}
         </span>
        }
       </div>
       <p class="text-xs text-textMuted font-medium tracking-wide">{{ 'RESULTS.LOSERS_WARN' | translate }}</p>
      }
     </div>
    }

    <div class="mt-4 w-full">
      <app-button-primary (onClick)="playAgain()">
       {{ 'RESULTS.PLAY_AGAIN' | translate }}
      </app-button-primary>
    </div>
   </div>
  </div>
 `,
  styles: `
  :host {
   display: block;
   width: 100%;
   height: 100%;
  }
 `
})
export class Results implements OnInit {
  engine = inject(GameEngineService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  adsService = inject(AdsService);
  themeService = inject(ThemeService);
  billing = inject(BillingService);
  ui = inject(UiService);
  destroyRef = inject(DestroyRef);

  showRoles = false;
  winner: 'impostors' | 'town' | null = null;
  reason: string | null = null;
  guess: string | null = null;
  detectiveName: string | null = null;

  impostors: any[] = [];
  survivingCivilians: any[] = [];
  detectives: any[] = [];

  ngOnInit() {
    this.route.queryParams.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.winner = params['winner'] || null;
      this.reason = params['reason'] || null;
      this.guess = params['guess'] || null;

      const dId = parseInt(params['detectiveId'], 10);
      if (dId && !isNaN(dId)) {
        this.detectiveName = this.engine.players().find(p => p.id === dId)?.name || null;
      }

      if (this.reason === 'guess' && this.guess) {
        const isCorrect = this.guess.toLowerCase() === this.engine.secretWord()?.word.toLowerCase();
        if (isCorrect) {
          this.winner = 'town';
        } else {
          this.winner = 'impostors';
        }
      }
    });

    this.impostors = this.engine.players().filter(p => p.isImpostor);
    this.survivingCivilians = this.engine.alivePlayers().filter(p => !p.isImpostor && !p.isDetective);
    this.detectives = this.engine.players().filter(p => p.isDetective);
  }

  title() {
    if (this.winner === 'impostors') return 'RESULTS.WIN_IMPOSTORS';
    if (this.winner === 'town') {
      if (this.reason === 'guess') return 'RESULTS.WIN_DETECTIVES';
      return 'RESULTS.WIN_CIVILS';
    }
    return 'RESULTS.ABORTED';
  }

  subtitle() {
    if (this.reason === 'time') return 'El tiempo se agotó.';
    if (this.reason === 'guess') return 'El detective falló intentando adivinar.';
    if (this.winner === 'impostors') return 'Los impostores lograron igualar en número al pueblo.';
    if (this.winner === 'town') return 'Todos los impostores han sido eliminados del juego.';
    return '';
  }

  backgroundClass() {
    if (this.themeService.currentTheme() === 'infantil') return 'bg-transparent';
    if (this.winner === 'town') {
      if (this.reason === 'guess') return 'bg-gradient-to-br from-indigo-900 to-slate-900';
      return 'bg-gradient-to-br from-cyan-900 to-slate-900';
    }
    return 'bg-gradient-to-br from-pink-900 to-slate-900';
  }

  textClass() {
    if (this.themeService.currentTheme() === 'infantil') {
      if (this.winner === 'town') {
        if (this.reason === 'guess') return 'text-indigo-600 drop-shadow-sm';
        return 'text-cyan-600 drop-shadow-sm';
      }
      return 'text-pink-600 drop-shadow-sm';
    }
    if (this.winner === 'town') {
      if (this.reason === 'guess') return 'text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]';
      return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]';
    }
    return 'text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]';
  }

  async playAgain() {
    this.ui.setLoading(true);
    try {
      await this.adsService.showInterstitial();
      const isOnline = this.engine.isOnline();
      this.engine.resetGame();
      if (!isOnline) {
        await this.router.navigate(['/setup']);
      }
    } finally {
      this.ui.setLoading(false);
    }
  }
}
