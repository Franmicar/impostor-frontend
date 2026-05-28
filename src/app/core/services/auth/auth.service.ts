import { Injectable, signal, inject } from '@angular/core';
import { UiService } from '../ui/ui.service';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    signInWithCredential,
    GoogleAuthProvider,
    OAuthProvider,
    onAuthStateChanged,
    signOut,
    User
} from 'firebase/auth';
import { environment } from '../../../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private app = initializeApp(environment.firebase);
    private auth = getAuth(this.app);

    // Signal reactivo para saber si hay un usuario logueado en la app
    public userSignal = signal<User | null>(null);
    private ui = inject(UiService);

    constructor() {
        onAuthStateChanged(this.auth, (user) => {
            this.userSignal.set(user);
        });
    }

    async loginWithGoogle() {
        this.ui.setLoading(true);
        try {
            if (Capacitor.isNativePlatform()) {
                const result = await FirebaseAuthentication.signInWithGoogle();
                const idToken = result.credential?.idToken;
                if (idToken) {
                    const credential = GoogleAuthProvider.credential(idToken);
                    await signInWithCredential(this.auth, credential);
                } else {
                    throw new Error("No idToken found in native Google Sign-In");
                }
            } else {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(this.auth, provider);
            }
        } catch (error) {
            console.error('Error durante el login con Google', error);
            throw error;
        } finally {
            this.ui.setLoading(false);
        }
    }

    async loginWithApple() {
        this.ui.setLoading(true);
        try {
            if (Capacitor.isNativePlatform()) {
                const result = await FirebaseAuthentication.signInWithApple();
                const idToken = (result.credential as any)?.idToken;
                const rawNonce = (result.credential as any)?.nonce;
                if (idToken) {
                    const provider = new OAuthProvider('apple.com');
                    const credential = provider.credential({
                        idToken: idToken,
                        rawNonce: rawNonce
                    });
                    await signInWithCredential(this.auth, credential);
                } else {
                    throw new Error("No idToken found in native Apple Sign-In");
                }
            } else {
                const provider = new OAuthProvider('apple.com');
                await signInWithPopup(this.auth, provider);
            }
        } catch (error) {
            console.error('Error durante el login con Apple', error);
            throw error;
        } finally {
            this.ui.setLoading(false);
        }
    }

    async logout() {
        this.ui.setLoading(true);
        try {
            if (Capacitor.isNativePlatform()) {
                await FirebaseAuthentication.signOut();
            }
            await signOut(this.auth);
        } catch (error) {
            console.error('Error al cerrar sesión', error);
            throw error;
        } finally {
            this.ui.setLoading(false);
        }
    }

    get currentUser(): User | null {
        return this.auth.currentUser;
    }
}
