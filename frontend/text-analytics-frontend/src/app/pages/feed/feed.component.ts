import { Component, inject, signal, computed } from '@angular/core';
import { FeedService } from '../../core/services/feed.service';
import { FeedMessage } from '../../core/models/sentinel.models';
import { formatTs } from '../../core/data/sentinel.data';
import { CatBadgeComponent } from '../../shared/components/cat-badge.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CatBadgeComponent],
  template: `
    <div class="page-root">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <span class="live-dot"></span>
            Live Message Feed
          </h1>
          <p class="page-sub">Real-time stream from MARBERT inference engine</p>
        </div>
        <div class="header-actions">
          <div class="stat-chip">
            <span class="sc-label">Total</span>
            <span class="sc-val mono">{{ feedSvc.messages().length }}</span>
          </div>
          <div class="stat-chip flagged">
            <span class="sc-label">Flagged</span>
            <span class="sc-val mono">{{ flaggedCount() }}</span>
          </div>
          <button class="pause-btn" [class.paused]="feedSvc.paused()" (click)="feedSvc.togglePause()">
            @if (feedSvc.paused()) {
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Resume
            } @else {
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              Pause
            }
          </button>
        </div>
      </div>

      <!-- Feed table -->
      <div class="card feed-card">
        <div class="feed-col-head">
          <span style="width:100px">ID</span>
          <span style="flex:1">Message</span>
          <span style="width:140px">Category</span>
          <span style="width:72px">Conf</span>
          <span style="width:62px">Lat</span>
          <span style="width:82px">Time</span>
          <span style="width:68px">Status</span>
        </div>

        <div class="feed-rows">
          @for (msg of feedSvc.messages(); track msg.id) {
            <div class="feed-row" [class]="msg.status" (click)="select(msg)">
              <span class="col-id mono">{{ msg.id }}</span>
              <span class="col-text" dir="rtl">{{ msg.text }}</span>
              <span class="col-cat">
                @if (msg.cat) {
                  <app-cat-badge [catKey]="msg.catKey!" [score]="msg.conf!" />
                } @else {
                  <span class="muted" style="font-size:11px">—</span>
                }
              </span>
              <span class="col-conf mono" [class.high]="(msg.conf ?? 0) >= .8">
                {{ msg.conf ? (msg.conf * 100).toFixed(0) + '%' : '—' }}
              </span>
              <span class="col-lat mono">{{ msg.lat }}ms</span>
              <span class="col-time mono">{{ formatTs(msg.ts) }}</span>
              <span class="status-pill pill-{{ msg.status }}">{{ msg.status }}</span>
            </div>
          }
        </div>

        @if (feedSvc.paused()) {
          <div class="paused-banner">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            Feed paused — {{ feedSvc.messages().length }} messages buffered
          </div>
        }
      </div>

    </div>

    <!-- Detail Drawer -->
    @if (selected()) {
      <div class="drawer-overlay" (click)="selected.set(null)">
        <div class="drawer" (click)="$event.stopPropagation()">
          <div class="drawer-header">
            <div class="drawer-title">Message Detail</div>
            <button class="drawer-close" (click)="selected.set(null)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="drawer-body">
            <div class="d-row">
              <span class="d-label">Message ID</span>
              <span class="d-val mono">{{ selected()!.id }}</span>
            </div>
            <div class="d-row">
              <span class="d-label">Status</span>
              <span class="status-pill pill-{{ selected()!.status }}">{{ selected()!.status }}</span>
            </div>
            <div class="d-row">
              <span class="d-label">Timestamp</span>
              <span class="d-val mono">{{ formatTs(selected()!.ts) }}</span>
            </div>
            <div class="d-row">
              <span class="d-label">Inference Latency</span>
              <span class="d-val mono">{{ selected()!.lat }}ms</span>
            </div>

            @if (selected()!.cat) {
              <div class="d-row">
                <span class="d-label">Category</span>
                <app-cat-badge [catKey]="selected()!.catKey!" [score]="selected()!.conf!" />
              </div>
              <div class="d-row">
                <span class="d-label">Confidence</span>
                <div class="conf-bar-wrap">
                  <div class="conf-bar" [style.width.%]="(selected()!.conf! * 100)"></div>
                  <span class="mono" style="font-size:12px">{{ (selected()!.conf! * 100).toFixed(1) }}%</span>
                </div>
              </div>
            }

            <div class="d-section">Original Text</div>
            <div class="d-text" dir="rtl" lang="ar">{{ selected()!.text }}</div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-root { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .page-title { font-size: 22px; font-weight: 700; color: var(--text); margin: 0; display: flex; align-items: center; gap: 10px; }
    .page-sub { font-size: 13px; color: var(--muted); margin: 4px 0 0; }
    .header-actions { display: flex; align-items: center; gap: 10px; }

    .live-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--danger);
                box-shadow: 0 0 0 3px rgba(255,77,109,.3); animation: pulse 1.4s infinite; }
    @keyframes pulse { 0%,100%{box-shadow:0 0 0 3px rgba(255,77,109,.3)} 50%{box-shadow:0 0 0 6px rgba(255,77,109,.1)} }

    .stat-chip { display: flex; flex-direction: column; align-items: center; padding: 6px 14px;
                 background: rgba(108,99,255,.08); border-radius: 10px; }
    .stat-chip.flagged .sc-val { color: var(--danger); }
    .sc-label { font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
    .sc-val { font-size: 16px; font-weight: 700; color: var(--text); }

    .pause-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px;
                 border: 1px solid rgba(108,99,255,.3); background: none; color: var(--primary);
                 font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
    .pause-btn:hover { background: rgba(108,99,255,.12); }
    .pause-btn.paused { border-color: rgba(6,214,160,.4); color: var(--safe); }
    .pause-btn.paused:hover { background: rgba(6,214,160,.1); }

    .feed-card { padding: 0; overflow: hidden; }
    .feed-col-head {
      display: flex; align-items: center; gap: 12px; padding: 10px 16px;
      background: rgba(108,99,255,.06); border-bottom: 1px solid rgba(108,99,255,.1);
      font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted);
    }
    .feed-rows { max-height: calc(100vh - 260px); overflow-y: auto; }
    .feed-row {
      display: flex; align-items: center; gap: 12px; padding: 9px 16px;
      border-bottom: 1px solid rgba(108,99,255,.05); cursor: pointer;
      transition: background .1s; animation: slideIn .3s ease;
    }
    @keyframes slideIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }
    .feed-row:hover { background: rgba(108,99,255,.06); }
    .feed-row.flagged { background: rgba(255,183,3,.03); }
    .feed-row.blocked { background: rgba(255,77,109,.04); }

    .col-id { width: 100px; font-size: 11px; color: var(--primary); flex-shrink: 0; }
    .col-text { flex: 1; font-size: 13px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Cairo', sans-serif; }
    .col-cat { width: 140px; flex-shrink: 0; }
    .col-conf { width: 72px; flex-shrink: 0; font-size: 12px; color: var(--muted); }
    .col-conf.high { color: var(--danger); }
    .col-lat { width: 62px; flex-shrink: 0; font-size: 11px; color: var(--muted); }
    .col-time { width: 82px; flex-shrink: 0; font-size: 11px; color: var(--muted); }

    .status-pill { width: 68px; flex-shrink: 0; font-size: 9px; font-weight: 700; letter-spacing: .05em;
                   text-transform: uppercase; padding: 3px 8px; border-radius: 6px; text-align: center; }
    .pill-safe { background: rgba(6,214,160,.12); color: var(--safe); }
    .pill-flagged { background: rgba(255,183,3,.12); color: var(--warn); }
    .pill-blocked { background: rgba(255,77,109,.12); color: var(--danger); }

    .paused-banner { display: flex; align-items: center; justify-content: center; gap: 8px;
                     padding: 10px; background: rgba(255,183,3,.08); color: var(--warn);
                     font-size: 13px; font-weight: 500; }

    /* Drawer */
    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 200;
                      display: flex; justify-content: flex-end; backdrop-filter: blur(2px); }
    .drawer { width: 400px; height: 100%; background: var(--surface); border-left: 1px solid rgba(108,99,255,.2);
              display: flex; flex-direction: column; animation: drawerIn .2s ease; }
    @keyframes drawerIn { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
    .drawer-header { display: flex; align-items: center; justify-content: space-between;
                     padding: 20px; border-bottom: 1px solid rgba(108,99,255,.1); }
    .drawer-title { font-size: 16px; font-weight: 700; color: var(--text); }
    .drawer-close { background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; border-radius: 6px; }
    .drawer-close:hover { background: rgba(108,99,255,.1); color: var(--text); }
    .drawer-body { padding: 20px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
    .d-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .d-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); width: 130px; flex-shrink: 0; }
    .d-val { font-size: 13px; color: var(--text); }
    .d-section { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--primary); margin-top: 8px; }
    .d-text { font-size: 15px; color: var(--text); line-height: 1.7; font-family: 'Cairo', sans-serif;
              background: rgba(108,99,255,.06); border-radius: 10px; padding: 14px; }
    .conf-bar-wrap { display: flex; align-items: center; gap: 10px; flex: 1; }
    .conf-bar { height: 6px; background: var(--danger); border-radius: 3px; min-width: 4px; max-width: 180px; }
  `]
})
export class FeedComponent {
  readonly feedSvc = inject(FeedService);
  selected = signal<FeedMessage | null>(null);
  formatTs = formatTs;

  flaggedCount = computed(() => this.feedSvc.messages().filter(m => m.status !== 'safe').length);

  select(msg: FeedMessage) { this.selected.set(msg); }
}
