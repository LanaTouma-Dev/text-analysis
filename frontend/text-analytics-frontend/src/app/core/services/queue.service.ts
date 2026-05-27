import { Injectable, signal, computed } from '@angular/core';
import { QueueMessage, MessageStatus } from '../models/sentinel.models';
import { genQueue } from '../data/sentinel.data';

@Injectable({ providedIn: 'root' })
export class QueueService {
  private _queue = signal<QueueMessage[]>(genQueue(14));

  readonly queue = this._queue.asReadonly();

  readonly pendingCount = computed(() =>
    this._queue().filter(q => q.status === 'pending').length
  );

  readonly pendingMessages = computed(() =>
    this._queue().filter(q => q.status === 'pending')
  );

  decide(id: string, status: MessageStatus): void {
    this._queue.update(qs => qs.map(q => q.id === id ? { ...q, status } : q));
  }

  addMessages(msgs: QueueMessage[]): void {
    this._queue.update(qs => [...qs, ...msgs]);
  }

  approveAll(): void {
    this._queue.update(qs => qs.map(q => q.status === 'pending' ? { ...q, status: 'approved' } : q));
  }
}
