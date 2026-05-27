import { Injectable, signal, OnDestroy } from '@angular/core';
import { FeedMessage } from '../models/sentinel.models';
import { makeFeedMessage } from '../data/sentinel.data';

@Injectable({ providedIn: 'root' })
export class FeedService implements OnDestroy {
  readonly messages = signal<FeedMessage[]>(
    Array.from({ length: 20 }, (_, i) => makeFeedMessage(100000 - i))
  );
  readonly paused = signal(false);

  private counter = 100001;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() { this.start(); }

  private start(): void {
    this.intervalId = setInterval(() => {
      if (this.paused()) return;
      const m = makeFeedMessage(this.counter++);
      this.messages.update(xs => [m, ...xs].slice(0, 150));
    }, 900 + Math.random() * 700);
  }

  togglePause(): void {
    this.paused.update(p => !p);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
