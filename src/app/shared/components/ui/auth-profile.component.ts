import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ModalComponent } from './modal.component';
import { ButtonPrimaryComponent } from './button-primary.component';

@Component({
  selector: 'app-auth-profile',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonPrimaryComponent],
  template: `
    @if (authService.userSignal()) {
      <img [src]="authService.userSignal()?.photoURL || '/images/default-avatar.png'" 
           referrerpolicy="no-referrer" 
           [class]="avatarSize + ' rounded-full border-2 border-secondary shadow-[0_0_10px_rgb(var(--color-secondary)/0.4)] cursor-pointer hover:scale-105 transition-transform'" 
           (click)="isLogoutModalOpen.set(true)" 
           title="Opciones de cuenta" />
    } @else if (showLoginButton) {
      <app-button-primary size="small" (onClick)="authService.loginWithGoogle()">
        Login
      </app-button-primary>
    }

    <!-- LOGOUT MODAL -->
    <app-modal
      [isOpen]="isLogoutModalOpen()"
      title="Cerrar Sesión"
      icon="error"
      (onClose)="isLogoutModalOpen.set(false)">
      
      <p class="text-sm text-textMuted mb-4 w-full text-center">
        ¿Estás seguro de que quieres cerrar tu sesión actual?
      </p>
      
      <div modal-footer class="w-full flex gap-3">
        <button (click)="isLogoutModalOpen.set(false)" class="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-glass-border text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgb(var(--color-secondary)/0.4)] active:scale-95 uppercase tracking-widest text-xs">
          Cancelar
        </button>
        <button (click)="confirmLogout()" class="flex-1 py-3 bg-gradient-to-r from-rose-500 to-rose-700 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgb(var(--color-secondary)/0.4)] active:scale-95 uppercase tracking-widest text-xs">
          Salir
        </button>
      </div>
    </app-modal>
  `
})
export class AuthProfileComponent {
  authService = inject(AuthService);
  isLogoutModalOpen = signal(false);

  @Input() avatarSize: string = 'w-10 h-10';
  @Input() showLoginButton: boolean = true;

  confirmLogout() {
    this.isLogoutModalOpen.set(false);
    this.authService.logout();
  }
}
