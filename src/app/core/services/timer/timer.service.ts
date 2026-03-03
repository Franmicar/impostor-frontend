import { Injectable, signal, computed } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TimerService {
    timeLeftInSeconds = signal<number>(0);
    isActive = signal<boolean>(false);
    private intervalId: any;

    formattedTime = computed(() => {
        const totalSeconds = this.timeLeftInSeconds();
        if (totalSeconds <= 0) return '00:00';

        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    });

    isTimeUp = computed(() => {
        return this.isActive() && this.timeLeftInSeconds() <= 0;
    });

    start(minutes: number) {
        this.stop();
        this.timeLeftInSeconds.set(minutes * 60);
        if (minutes > 0) {
            this.resume();
        }
    }

    resume() {
        if (this.isActive() || this.timeLeftInSeconds() <= 0) return;
        this.isActive.set(true);

        this.intervalId = setInterval(() => {
            this.timeLeftInSeconds.update(t => {
                if (t <= 1) {
                    this.stop();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
    }

    pause() {
        this.isActive.set(false);
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    stop() {
        this.pause();
        this.timeLeftInSeconds.set(0);
    }
}
