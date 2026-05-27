import { Injectable, signal } from '@angular/core';
import { ToastItem, ToastKind } from '../models/sentinel.models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);

  show(kind: ToastKind, title: string, msg: string): void {
    const id = Math.random().toString(36).slice(2);
    this.toasts.update(ts => [...ts, { id, kind, title, msg }]);
    setTimeout(() => this.toasts.update(ts => ts.filter(t => t.id !== id)), 3000);
  }

  dismiss(id: string): void {
    this.toasts.update(ts => ts.filter(t => t.id !== id));
  }
}
