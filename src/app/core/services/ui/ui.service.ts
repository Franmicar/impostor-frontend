import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private activeTasks = signal<number>(0);
  isLoading = computed(() => this.activeTasks() > 0);

  /**
   * Sets the global loading state.
   * If true, increments the active tasks counter.
   * If false, decrements the counter (min 0).
   * Supports multiple concurrent operations gracefully.
   */
  setLoading(isLoading: boolean) {
    if (isLoading) {
      this.activeTasks.update(v => v + 1);
    } else {
      this.activeTasks.update(v => Math.max(0, v - 1));
    }
  }

  /**
   * Forces the loading state to stop completely, resetting the counter to 0.
   * Useful for global resets or unhandled error recoveries.
   */
  forceStopLoading() {
    this.activeTasks.set(0);
  }
}
