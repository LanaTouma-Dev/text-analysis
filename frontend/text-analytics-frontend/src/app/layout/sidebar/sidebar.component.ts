import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QueueService } from '../../core/services/queue.service';

const NAV = [
  { id: 'overview',   label: 'Overview',      group: 'Moderation', badge: null },
  { id: 'review',     label: 'Review Queue',  group: 'Moderation', badge: 'queue' },
  { id: 'feed',       label: 'Message Feed',  group: 'Moderation', badge: 'live' },
  { id: 'analytics',  label: 'Analytics',     group: 'Insights',   badge: null },
  { id: 'categories', label: 'Categories',    group: 'Insights',   badge: null },
  { id: 'audit',      label: 'Audit Log',     group: 'Insights',   badge: null },
  { id: 'settings',   label: 'Settings',      group: 'System',     badge: null },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  template: `
    <aside class="sidebar">
      <!-- Brand -->
      <div class="brand">
        <div class="brand-logo">S</div>
        <div>
          <div class="brand-name">Syriatel</div>
          <div class="brand-sub">Sentinel · v3.4</div>
        </div>
      </div>

      <!-- Moderation group -->
      <div class="nav-group-label">Moderation</div>
      @for (n of moderation; track n.id) {
        <div [class]="'nav-item' + (isActive(n.id) ? ' active' : '')"
             (click)="navigate(n.id)">
          <span class="ico" [innerHTML]="icons[n.id]"></span>
          <span class="label">{{ n.label }}</span>
          @if (n.badge === 'queue') {
            <span style="display:inline-flex;align-items:center;gap:6px">
              <span class="pulse-dot"></span>
              <span class="badge badge-amber">{{ queueSvc.pendingCount() }}</span>
            </span>
          }
          @if (n.badge === 'live') {
            <span class="badge badge-live">LIVE</span>
          }
        </div>
      }

      <!-- Insights group -->
      <div class="nav-group-label">Insights</div>
      @for (n of insights; track n.id) {
        <div [class]="'nav-item' + (isActive(n.id) ? ' active' : '')"
             (click)="navigate(n.id)">
          <span class="ico" [innerHTML]="icons[n.id]"></span>
          <span class="label">{{ n.label }}</span>
        </div>
      }

      <!-- System group -->
      <div class="nav-group-label">System</div>
      @for (n of system; track n.id) {
        <div [class]="'nav-item' + (isActive(n.id) ? ' active' : '')"
             (click)="navigate(n.id)">
          <span class="ico" [innerHTML]="icons[n.id]"></span>
          <span class="label">{{ n.label }}</span>
        </div>
      }

      <!-- Health footer -->
      <div class="sidebar-footer">
        <div class="health-card">
          <div class="health-row">
            <div class="k"><span class="health-dot"></span> AceGPT Inference</div>
            <div class="health-val">12ms</div>
          </div>
          <div class="health-row">
            <div class="k"><span class="health-dot"></span> RabbitMQ Stream</div>
            <div class="health-val">99.99%</div>
          </div>
          <div class="health-row">
            <div class="k"><span class="health-dot warn"></span> GPU Cluster B</div>
            <div class="health-val">87%</div>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  router = inject(Router);
  queueSvc = inject(QueueService);

  moderation = NAV.filter(n => n.group === 'Moderation');
  insights   = NAV.filter(n => n.group === 'Insights');
  system     = NAV.filter(n => n.group === 'System');

  navigate(id: string) { this.router.navigate(['/' + id]); }
  isActive(id: string) { return this.router.url === '/' + id || this.router.url.startsWith('/' + id + '/'); }

  icons: Record<string, string> = {
    overview:   `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>`,
    review:     `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M3 13V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></svg>`,
    feed:       `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>`,
    analytics:  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>`,
    categories: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12L12 4H4v8l8 8z"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/></svg>`,
    audit:      `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6M8 9h2"/></svg>`,
    settings:   `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  };
}
