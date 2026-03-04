import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ConfirmService {
    isOpen = signal<boolean>(false);
    message = signal<string>('');

    private confirmSubject = new Subject<boolean>();

    requestConfirmation(message: string): Promise<boolean> {
        this.message.set(message);
        this.isOpen.set(true);

        return new Promise(resolve => {
            const sub = this.confirmSubject.subscribe(result => {
                sub.unsubscribe();
                this.isOpen.set(false);
                resolve(result);
            });
        });
    }

    respond(result: boolean) {
        this.confirmSubject.next(result);
    }
}
