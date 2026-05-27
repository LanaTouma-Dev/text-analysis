import { Component, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CATEGORIES, MOD_PERFORMANCE, genVolume24h } from '../../core/data/sentinel.data';
import { PillGroupComponent } from '../../shared/components/pill-group.component';

// Simple donut chart built with SVG path math
function donutPath(cx: number, cy: number, r: number, pct: number): string {
  const angle = pct * 2 * Math.PI - Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  const large = pct > 0.5 ? 1 : 0;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y} L ${cx} ${cy} Z`;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [PillGroupComponent],
  template: `
    <div class="page-root">

      <div class="page-header">
        <div>
          <h1 class="page-title">Analytics</h1>
          <p class="page-sub">Moderation insights and trends</p>
        </div>
        <app-pill-group [options]="['7D','30D','90D']" [value]="period()" (onChange)="period.set($event)" />
      </div>

      <!-- Top stats -->
      <div class="stats-row">
        <div class="card stat-card">
          <div class="stat-icon" style="background:rgba(6,214,160,.1);color:var(--safe)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12l5 5L20 6"/></svg>
          </div>
          <div class="stat-body">
            <div class="stat-label">Total Approved</div>
            <div class="stat-val" style="color:var(--safe)">{{ period() === '7D' ? '6.18M' : period() === '30D' ? '26.4M' : '78.2M' }}</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon" style="background:rgba(255,77,109,.1);color:var(--danger)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>
          </div>
          <div class="stat-body">
            <div class="stat-label">Total Blocked</div>
            <div class="stat-val" style="color:var(--danger)">{{ period() === '7D' ? '89.4K' : period() === '30D' ? '382K' : '1.1M' }}</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon" style="background:rgba(255,183,3,.1);color:var(--warn)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 14l8-8 8 8"/><path d="M12 6v12"/></svg>
          </div>
          <div class="stat-body">
            <div class="stat-label">Escalated</div>
            <div class="stat-val" style="color:var(--warn)">{{ period() === '7D' ? '1,247' : period() === '30D' ? '5,318' : '15.8K' }}</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon" style="background:rgba(108,99,255,.1);color:var(--primary)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M3 3v18h18"/></svg>
          </div>
          <div class="stat-body">
            <div class="stat-label">AI Accuracy</div>
            <div class="stat-val" style="color:var(--primary)">97.3%</div>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="charts-row">

        <!-- Category donut -->
        <div class="card donut-card">
          <div class="card-title">Flags by Category</div>
          <div class="card-sub" style="margin-bottom:16px">Distribution · last {{ period() }}</div>
          <div class="donut-wrap">
            <svg viewBox="0 0 200 200" width="180" height="180">
              @for (seg of donutSegments(); track seg.id; let i = $index) {
                <circle
                  cx="100" cy="100" [attr.r]="70"
                  fill="none"
                  [attr.stroke]="seg.color"
                  stroke-width="28"
                  [attr.stroke-dasharray]="seg.dash"
                  [attr.stroke-dashoffset]="seg.offset"
                  stroke-linecap="butt"
                  style="transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dasharray .6s ease"
                />
              }
              <circle cx="100" cy="100" r="56" fill="var(--surface)"/>
              <text x="100" y="96" text-anchor="middle" fill="var(--text)" font-size="18" font-weight="700" font-family="JetBrains Mono">12.5K</text>
              <text x="100" y="112" text-anchor="middle" fill="#6E6B97" font-size="10">total flags</text>
            </svg>
            <div class="donut-legend">
              @for (cat of categories.slice(0,6); track cat.id) {
                <div class="dl-row">
                  <span class="dl-dot" [style.background]="cat.color"></span>
                  <span class="dl-name">{{ cat.name }}</span>
                  <span class="dl-count mono">{{ cat.count.toLocaleString() }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Hourly heatmap -->
        <div class="card heatmap-card">
          <div class="card-title">Hourly Flag Heatmap</div>
          <div class="card-sub" style="margin-bottom:16px">Last 7 days · by hour</div>
          <div class="heatmap">
            <div class="hm-y-labels">
              @for (day of heatmapDays; track day) {
                <div class="hm-y">{{ day }}</div>
              }
            </div>
            <div class="hm-grid">
              @for (row of heatmapData; track $index) {
                <div class="hm-row">
                  @for (val of row; track $index) {
                    <div class="hm-cell" [style.background]="heatColor(val)" [title]="val + ' flags'"></div>
                  }
                </div>
              }
              <div class="hm-x-labels">
                @for (h of heatmapHours; track h) {
                  <div class="hm-x">{{ h }}</div>
                }
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Moderator performance -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">Moderator Performance</div>
          <div class="card-sub">Last {{ period() }}</div>
        </div>
        <div class="mod-table">
          <div class="mod-head">
            <span>Moderator</span>
            <span>Status</span>
            <span>Reviewed</span>
            <span>Accuracy</span>
            <span>Avg. Time</span>
            <span>Throughput</span>
          </div>
          @for (m of modPerf; track m.who) {
            <div class="mod-row">
              <div class="mod-name-cell">
                <div class="av-chip" [class.on]="m.on">{{ m.who }}</div>
                <span class="mod-name">{{ m.name }}</span>
              </div>
              <span class="status-dot-wrap">
                <span class="status-dot" [class.online]="m.on"></span>
                {{ m.on ? 'Online' : 'Offline' }}
              </span>
              <span class="mod-val mono">{{ m.reviewed.toLocaleString() }}</span>
              <div class="acc-cell">
                <div class="acc-bar" [style.width.%]="m.accuracy"></div>
                <span class="mono">{{ m.accuracy }}%</span>
              </div>
              <span class="mod-val mono">{{ m.avg }}</span>
              <div class="throughput-bar-wrap">
                <div class="throughput-bar" [style.width.%]="(m.reviewed / 1247) * 100"></div>
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `,
  styles: [`
    .page-root { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .page-title { font-size: 22px; font-weight: 700; color: var(--text); margin: 0; }
    .page-sub { font-size: 13px; color: var(--muted); margin: 4px 0 0; }

    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
    .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 4px; }
    .stat-val { font-size: 22px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .charts-row { display: grid; grid-template-columns: 380px 1fr; gap: 16px; }
    .donut-card { padding: 20px; }
    .donut-wrap { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
    .donut-legend { display: flex; flex-direction: column; gap: 8px; }
    .dl-row { display: flex; align-items: center; gap: 8px; }
    .dl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .dl-name { font-size: 12px; color: var(--muted); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }
    .dl-count { font-size: 12px; color: var(--text); }

    .heatmap-card { padding: 20px; }
    .heatmap { display: flex; gap: 8px; }
    .hm-y-labels { display: flex; flex-direction: column; gap: 4px; padding-top: 4px; }
    .hm-y { font-size: 10px; color: var(--muted); height: 20px; display: flex; align-items: center; justify-content: flex-end; }
    .hm-grid { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .hm-row { display: grid; grid-template-columns: repeat(24, 1fr); gap: 3px; }
    .hm-cell { height: 20px; border-radius: 3px; transition: transform .1s; cursor: default; }
    .hm-cell:hover { transform: scale(1.15); z-index: 1; }
    .hm-x-labels { display: grid; grid-template-columns: repeat(24, 1fr); gap: 3px; margin-top: 4px; }
    .hm-x { font-size: 8px; color: var(--muted); text-align: center; }

    .mod-table { margin-top: 16px; }
    .mod-head { display: grid; grid-template-columns: 200px 100px 90px 140px 90px 1fr;
                gap: 10px; padding: 8px 12px; font-size: 10px; font-weight: 700;
                text-transform: uppercase; letter-spacing: .06em; color: var(--muted);
                border-bottom: 1px solid rgba(108,99,255,.1); }
    .mod-row { display: grid; grid-template-columns: 200px 100px 90px 140px 90px 1fr;
               gap: 10px; padding: 12px; align-items: center;
               border-bottom: 1px solid rgba(108,99,255,.06); }
    .mod-row:last-child { border-bottom: none; }
    .mod-name-cell { display: flex; align-items: center; gap: 10px; }
    .av-chip { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
               font-size: 10px; font-weight: 700; background: rgba(108,99,255,.15); color: var(--primary); flex-shrink: 0; }
    .av-chip.on { background: rgba(6,214,160,.15); color: var(--safe); }
    .mod-name { font-size: 13px; color: var(--text); }
    .status-dot-wrap { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(108,99,255,.4); }
    .status-dot.online { background: var(--safe); box-shadow: 0 0 0 2px rgba(6,214,160,.2); }
    .mod-val { font-size: 13px; color: var(--text); }
    .acc-cell { display: flex; align-items: center; gap: 8px; }
    .acc-bar { height: 5px; background: var(--safe); border-radius: 3px; min-width: 4px; max-width: 70px; transition: width .6s; }
    .throughput-bar-wrap { height: 6px; background: rgba(108,99,255,.1); border-radius: 3px; overflow: hidden; }
    .throughput-bar { height: 100%; background: var(--primary); border-radius: 3px; transition: width .6s; }

    @media (max-width: 1100px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AnalyticsComponent {
  period = signal('7D');
  categories = CATEGORIES;
  modPerf = MOD_PERFORMANCE;

  heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  heatmapHours = Array.from({ length: 24 }, (_, i) => i % 4 === 0 ? String(i).padStart(2, '0') : '');
  heatmapData = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 120))
  );

  heatColor(v: number): string {
    const t = v / 120;
    if (t < 0.15) return 'rgba(108,99,255,.06)';
    if (t < 0.35) return 'rgba(108,99,255,.18)';
    if (t < 0.55) return 'rgba(255,183,3,.25)';
    if (t < 0.75) return 'rgba(255,183,3,.5)';
    return 'rgba(255,77,109,.6)';
  }

  donutSegments = computed(() => {
    const total = CATEGORIES.reduce((s, c) => s + c.count, 0);
    const circumference = 2 * Math.PI * 70; // r=70
    let offset = 0;
    return CATEGORIES.map(cat => {
      const frac = cat.count / total;
      const dash = frac * circumference;
      const seg = { id: cat.id, color: cat.color, dash: `${dash} ${circumference}`, offset: -offset * circumference / (2 * Math.PI * 70) * (2 * Math.PI * 70) };
      // Simpler: use stroke-dasharray and stroke-dashoffset directly
      const dashLen = frac * circumference;
      const dashOffset = -offset * circumference;
      offset += frac;
      return { id: cat.id, color: cat.color, dash: `${dashLen} ${circumference - dashLen}`, offset: dashOffset };
    });
  });
}
