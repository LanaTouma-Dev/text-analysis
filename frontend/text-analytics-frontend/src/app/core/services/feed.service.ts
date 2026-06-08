import { Injectable, signal, OnDestroy, inject } from '@angular/core';
import { FeedMessage } from '../models/sentinel.models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeedService implements OnDestroy {
  readonly messages = signal<FeedMessage[]>([]);
  readonly paused   = signal(false);
  readonly connected = signal(false);

  private auth = inject(AuthService);
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
      console.log('Feed WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      if (this.paused()) return;
      const msg = JSON.parse(event.data) as FeedMessage;
      this.messages.update(xs => [msg, ...xs].slice(0, 150));
    };

    this.ws.onclose = () => {
      this.connected.set(false);
      // Auto-reconnect after 3s
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (err) => {
      console.error('Feed WebSocket error', err);
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
