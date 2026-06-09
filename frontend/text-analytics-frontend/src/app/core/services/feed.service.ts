import { Injectable, signal, OnDestroy, inject } from '@angular/core';
import { FeedMessage } from '../models/sentinel.models';
import { QueueService } from './queue.service';
import { environment } from '../../../environments/environment';
import { CATEGORIES } from '../data/sentinel.data';

@Injectable({ providedIn: 'root' })
export class FeedService implements OnDestroy {
  readonly messages  = signal<FeedMessage[]>([]);
  readonly paused    = signal(false);
  readonly connected = signal(false);

  private queueSvc = inject(QueueService);
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.connect();
  }

  private connect(): void {
    const token = localStorage.getItem('access_token');
    const url   = `${environment.wsBase}/feed/${token ? '?token=' + token : ''}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.connected.set(true);
      console.log('[Sentinel] Feed WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const raw = JSON.parse(event.data);

      // Map backend payload → FeedMessage interface
      const msg: FeedMessage = {
        id:     raw.id,
        status: raw.status,
        text:   raw.text,
        // catKey is the raw key used by CatBadge; cat is the display label
        catKey: raw.cat ?? null,
        cat:    raw.cat
                  ? (CATEGORIES.find(c => c.id === raw.cat)?.name ?? raw.cat)
                  : null,
        conf:   raw.conf  ?? null,
        lat:    raw.lat   ?? 0,
        ts:     new Date(raw.ts),
      };

      if (!this.paused()) {
        this.messages.update(xs => [msg, ...xs].slice(0, 150));
      }

      // A new flagged message hit the pipeline → refresh the review queue
      if (raw.status === 'flagged') {
        this.queueSvc.load();
      }
    };

    this.ws.onclose = () => {
      this.connected.set(false);
      // Auto-reconnect after 3 s
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (err) => {
      console.error('[Sentinel] Feed WebSocket error', err);
    };
  }

  togglePause(): void {
    this.paused.update(p => !p);
  }

  ngOnDestroy(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}
