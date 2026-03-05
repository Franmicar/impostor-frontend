import { Injectable, inject } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../../environments/environment';
import { PlayerConfig } from '../../../features/setup/setup.component';

export interface Preset {
    id: string; // Document ID
    name: string; // Custom user name for the group e.g. "Amigos del pueblo"
    players: PlayerConfig[];
}

@Injectable({
    providedIn: 'root'
})
export class CloudPresetsService {
    private authService = inject(AuthService);
    private db: any;

    constructor() {
        const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
        this.db = getFirestore(app);
    }

    async getUserPresets(): Promise<Preset[]> {
        const user = this.authService.currentUser;
        if (!user) throw new Error('No auth user');

        const colRef = collection(this.db, `users/${user.uid}/presets`);
        const snap = await getDocs(colRef);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Preset));
    }

    async savePreset(presetName: string, players: PlayerConfig[]): Promise<void> {
        const user = this.authService.currentUser;
        if (!user) throw new Error('No auth user');

        const presets = await this.getUserPresets();

        // Check if we need to overwrite one or add new
        // For simplicity, if we already have 3, we throw error to be handled by UI
        if (presets.length >= 3 && !presets.find(p => p.name === presetName)) {
            throw new Error('LIMIT_REACHED');
        }

        // Generate valid ID from name or take existing
        const existing = presets.find(p => p.name === presetName);
        const docId = existing ? existing.id : Date.now().toString();

        const docRef = doc(this.db, `users/${user.uid}/presets/${docId}`);
        // Clean out base64 photos to avoid huge database rows unless we use storage
        // But blob data URLs are local! They won't work across sessions easily if they are blob:.
        // If they are base64 string, they are huge, but they work. 
        // We'll keep them as is. If it's a blob url it'll break, but input file uses DataURL which is base64.
        await setDoc(docRef, {
            name: presetName,
            players: players
        });
    }

    async deletePreset(presetId: string): Promise<void> {
        const user = this.authService.currentUser;
        if (!user) throw new Error('No auth user');
        const docRef = doc(this.db, `users/${user.uid}/presets/${presetId}`);
        await deleteDoc(docRef);
    }
}
