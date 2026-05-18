import { Injectable, inject } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { AuthService } from '../auth/auth.service';
import { UiService } from '../ui/ui.service';
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
    private ui = inject(UiService);
    private db: any;

    constructor() {
        const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
        this.db = getFirestore(app);
    }

    async getUserPresets(): Promise<Preset[]> {
        const user = this.authService.currentUser;
        if (!user) throw new Error('No auth user fetching presets');

        this.ui.setLoading(true);
        try {
            const colRef = collection(this.db, `users/${user.uid}/presets`);
            const snap = await getDocs(colRef);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Preset));
        } finally {
            this.ui.setLoading(false);
        }
    }

    async savePreset(presetName: string, players: PlayerConfig[], presetId?: string): Promise<void> {
        const user = this.authService.currentUser;
        if (!user) throw new Error('No auth user saving presets');

        this.ui.setLoading(true);
        try {
            const presets = await this.getUserPresets();

            // If we are creating a new one or saving with a new name that doesn't match the current ID
            const existingByName = presets.find(p => p.name === presetName);
            if (!presetId && presets.length >= 3 && !existingByName) {
                throw new Error('LIMIT_REACHED');
            }

            const docId = presetId || (existingByName ? existingByName.id : Date.now().toString());

            const docRef = doc(this.db, `users/${user.uid}/presets/${docId}`);
            await setDoc(docRef, {
                name: presetName,
                players: players
            });
        } finally {
            this.ui.setLoading(false);
        }
    }

    async deletePreset(presetId: string): Promise<void> {
        const user = this.authService.currentUser;
        if (!user) throw new Error('No auth user deleting preset');
        
        this.ui.setLoading(true);
        try {
            const docRef = doc(this.db, `users/${user.uid}/presets/${presetId}`);
            await deleteDoc(docRef);
        } finally {
            this.ui.setLoading(false);
        }
    }
}
