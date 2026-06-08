import { Injectable, signal, computed, inject } from '@angular/core';
import { QueueMessage, MessageStatus } from '../models/sentinel.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class QueueService {
  private api = inject(ApiService);
  private _queue = signal<QueueMessage[]>([]);

  readonly queue         = this._queue.asReadonly();
  readonly pendingCount  = computed(() => this._queue().filter(q => q.status === 'pending').length);
  readonly pendingMessages = computed(() => this._queue().filter(q => q.status === 'pending'));

  constructor() {
    this.load();
  }

  load() {
    this.api.getQueue('pending').subscribe({
      next: res => this._queue.set(res.results),
      error: err => console.error('Queue load failed', err),
    });
  }

  decide(id: string, status: MessageStatus): void {
    // Optimistic update
    this._queue.update(qs => qs.map(q => q.id === id ? { ...q, status } : q));
    this.api.decide(id, status).subscribe({
      error: () => {
        // Revert on failure
        this.load();
      }
    });
  }

  addMessages(msgs: QueueMessage[]): void {
    this._queue.update(qs => [...qs, ...msgs]);
  }

  approveAll(): void {
    const pending = this._queue().filter(q => q.status === 'pending');
    pending.forEach(q => this.decide(q.id, 'approved'));
  }
}
