import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    User
} from 'firebase/auth';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private app = initializeApp(environment.firebase);
    private auth = getAuth(this.app);

    // Signal reactivo para saber si hay un usuario logueado en la app
    public userSignal = signal<User | null>(null);

    constructor() {
        onAuthStateChanged(this.auth, (user) => {
            this.userSignal.set(user);
        });
    }

    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(this.auth, provider);
        } catch (error) {
            console.error('Error durante el login con Google', error);
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
        } catch (error) {
            console.error('Error al cerrar sesión', error);
            throw error;
        }
    }

    get currentUser(): User | null {
        return this.auth.currentUser;
    }
}
