import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { QueueMessage, MessageStatus } from '../models/sentinel.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class QueueService implements OnDestroy {
  private api = inject(ApiService);
  private _queue  = signal<QueueMessage[]>([]);
  private _pollTimer: ReturnType<typeof setInterval> | null = null;

  readonly queue           = this._queue.asReadonly();
  readonly pendingCount    = computed(() => this._queue().filter(q => q.status === 'pending').length);
  readonly pendingMessages = computed(() => this._queue().filter(q => q.status === 'pending'));

  constructor() {
    this.load();
    // Fallback poll every 30 s in case a WS message was missed
    this._pollTimer = setInterval(() => this.load(), 30_000);
  }

  ngOnDestroy() {
    if (this._pollTimer) clearInterval(this._pollTimer);
  }

  /** Reload the queue from the API (flagged only, all moderation statuses). */
  load(): void {
    // flagged=true excludes 'safe' auto-released messages from the review queue
    this.api.getQueue(undefined, true).subscribe({
      next: res => this._queue.set(res.results ?? []),
      error: err => console.error('[Queue] load failed', err),
    });
  }

  decide(id: string, status: MessageStatus): void {
    // Optimistic update
    this._queue.update(qs => qs.map(q => q.id === id ? { ...q, status } : q));
    this.api.decide(id, status).subscribe({
      error: () => this.load(), // revert on server error
    });
  }

  addMessages(msgs: QueueMessage[]): void {
    this._queue.update(qs => [...qs, ...msgs]);
  }

  approveAll(): void {
    this._queue()
      .filter(q => q.status === 'pending')
      .forEach(q => this.decide(q.id, 'approved'));
  }
}
