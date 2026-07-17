import { Injectable, signal, inject } from '@angular/core';
import { UiService } from '../ui/ui.service';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    signInWithCredential,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    deleteUser,
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
    public isInitialized = signal<boolean>(false);
    private ui = inject(UiService);

    constructor() {
        onAuthStateChanged(this.auth, (user) => {
            this.userSignal.set(user);
            this.isInitialized.set(true);
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

    /**
     * Elimina permanentemente la cuenta de Firebase Auth del usuario actual.
     * Si Firebase exige un login reciente, reautentica con el mismo proveedor
     * (Google/Apple) y reintenta una vez.
     */
    async deleteAccount(): Promise<void> {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No hay usuario autenticado');

        try {
            await deleteUser(user);
        } catch (error: any) {
            if (error?.code === 'auth/requires-recent-login') {
                await this.reauthenticate(user);
                await deleteUser(user);
            } else {
                throw error;
            }
        }
    }

    private async reauthenticate(user: User): Promise<void> {
        const providerId = user.providerData[0]?.providerId;
        const isApple = providerId === 'apple.com';

        if (Capacitor.isNativePlatform()) {
            if (isApple) {
                const result = await FirebaseAuthentication.signInWithApple();
                const idToken = (result.credential as any)?.idToken;
                const rawNonce = (result.credential as any)?.nonce;
                if (!idToken) throw new Error('No idToken found reauthenticating with Apple');
                const provider = new OAuthProvider('apple.com');
                const credential = provider.credential({ idToken, rawNonce });
                await reauthenticateWithCredential(user, credential);
            } else {
                const result = await FirebaseAuthentication.signInWithGoogle();
                const idToken = result.credential?.idToken;
                if (!idToken) throw new Error('No idToken found reauthenticating with Google');
                const credential = GoogleAuthProvider.credential(idToken);
                await reauthenticateWithCredential(user, credential);
            }
        } else {
            const provider = isApple ? new OAuthProvider('apple.com') : new GoogleAuthProvider();
            await reauthenticateWithPopup(user, provider);
        }
    }
}
