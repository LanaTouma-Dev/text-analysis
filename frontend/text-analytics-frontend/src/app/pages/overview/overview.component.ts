import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { QueueService } from '../../core/services/queue.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';
import { CATEGORIES } from '../../core/data/sentinel.data';
import { VolumePoint } from '../../core/models/sentinel.models';
import { AreaChartComponent } from './area-chart.component';
import { CategoryBarsComponent } from './category-bars.component';
import { SparkBarsComponent } from './spark-bars.component';
import { CountUpComponent } from '../../shared/components/count-up.component';
import { PillGroupComponent } from '../../shared/components/pill-group.component';
import { CatBadgeComponent } from '../../shared/components/cat-badge.component';

type Range = '1H' | '24H' | '7D' | '30D';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    DatePipe, SlicePipe,
    AreaChartComponent, CategoryBarsComponent, SparkBarsComponent,
    CountUpComponent, PillGroupComponent, CatBadgeComponent,
  ],
  template: `
    <div class="page-root">

      <!-- KPI Row -->
      <div class="kpi-row">
        <div class="card kpi-card">
          <div class="kpi-label">Messages Today</div>
          <div class="kpi-val"><app-count-up [value]="summary().total_24h" /></div>
          <div class="kpi-delta up">last 24 hours</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Flagged</div>
          <div class="kpi-val flagged-val"><app-count-up [value]="summary().flagged_24h" /></div>
          <div class="kpi-delta warn">{{ summary().pending }} pending review</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Block Rate</div>
          <div class="kpi-val">{{ summary().block_rate }}%</div>
          <div class="kpi-delta">last 24 hours</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Avg. Latency</div>
          <div class="kpi-val latency-row">
            <span>~42<span style="font-size:14px;font-weight:400;color:var(--muted)">ms</span></span>
            <app-spark-bars [values]="latencySpark" />
          </div>
          <div class="kpi-delta up">MARBERT · GPU</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-label">Blocked</div>
          <div class="kpi-val" style="color:var(--danger)"><app-count-up [value]="summary().blocked_24h" /></div>
          <div class="kpi-delta down">last 24 hours</div>
        </div>
      </div>

      <!-- Volume chart + category breakdown -->
      <div class="main-grid">
        <div class="card chart-card">
          <div class="card-head">
            <div>
              <div class="card-title">Message Volume</div>
              <div class="card-sub">Safe vs. flagged over time</div>
            </div>
            <app-pill-group [options]="ranges" [value]="range()" (onChange)="setRange($event)" />
          </div>
          <div style="margin-top:12px">
            <app-area-chart [data]="chartData()" [height]="240" />
          </div>
          <div class="chart-legend">
            <span class="leg-dot" style="background:#06D6A0"></span><span class="leg-lbl">Safe</span>
            <span class="leg-dot" style="background:#FFB703"></span><span class="leg-lbl">Flagged</span>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div>
              <div class="card-title">Flag Breakdown</div>
              <div class="card-sub">By category</div>
            </div>
          </div>
          <div style="margin-top:16px">
            <app-category-bars [categories]="categoryData()" />
          </div>
        </div>
      </div>

      <!-- Queue preview + activity -->
      <div class="bottom-grid">

        <div class="card">
          <div class="card-head">
            <div>
              <div class="card-title">Review Queue</div>
              <div class="card-sub">{{ queueSvc.pendingCount() }} pending</div>
            </div>
            <button class="btn-ghost" (click)="approveAll()">Approve All Safe</button>
          </div>
          <div class="queue-preview">
            @for (msg of queueSvc.pendingMessages().slice(0, 5); track msg.id) {
              <div class="qp-row">
                <div class="qp-id mono">{{ msg.id }}</div>
                <div class="qp-text" dir="rtl">{{ msg.ar }}</div>
                <div class="qp-cats">
                  @for (c of msg.cats.slice(0,2); track c[0]) {
                    <app-cat-badge [catKey]="c[0]" [score]="c[1]" />
                  }
                </div>
                <div class="qp-actions">
                  <button class="act approve" (click)="decide(msg.id, 'approved')" title="Approve">✓</button>
                  <button class="act block" (click)="decide(msg.id, 'blocked')" title="Block">✕</button>
                </div>
              </div>
            }
            @if (queueSvc.pendingCount() === 0) {
              <div class="empty-state" style="padding:32px 0">
                <div style="font-size:28px">✓</div>
                <div style="color:var(--safe);font-weight:600;margin-top:8px">Queue clear</div>
                <div style="color:var(--muted);font-size:13px;margin-top:4px">No messages pending review</div>
              </div>
            }
          </div>
        </div>

        <!-- Recent activity from audit log -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">Recent Activity</div>
            <div class="card-sub">Latest moderation actions</div>
          </div>
          <div class="activity-list">
            @for (a of recentActivity(); track $index) {
              <div class="activity-row">
                <div class="av-chip av-{{ a.action }}">{{ a.moderator_name | slice:0:2 }}</div>
                <div class="activity-body">
                  <div class="activity-name">{{ a.moderator_name }}</div>
                  <div class="activity-msg" dir="rtl">{{ a.message_body }}</div>
                </div>
                <div class="activity-right">
                  <span class="act-badge act-{{ a.action }}">{{ a.action }}</span>
                  <span class="activity-time">{{ a.created_at | date:'HH:mm' }}</span>
                </div>
              </div>
            }
            @if (recentActivity().length === 0) {
              <div style="padding:24px;text-align:center;color:var(--muted);font-size:13px">No activity yet</div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-root { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
    .kpi-card { padding: 20px; }
    .kpi-label { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
    .kpi-val { font-size: 28px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .flagged-val { color: var(--warn); }
    .kpi-delta { font-size: 12px; margin-top: 6px; color: var(--muted); }
    .kpi-delta.up { color: var(--safe); }
    .kpi-delta.down { color: var(--danger); }
    .kpi-delta.warn { color: var(--warn); }
    .latency-row { display: flex; align-items: center; gap: 12px; }
    .main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 16px; }
    .chart-card .card-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .chart-legend { display: flex; align-items: center; gap: 16px; margin-top: 12px; justify-content: center; }
    .leg-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .leg-lbl { font-size: 12px; color: var(--muted); }
    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .queue-preview { display: flex; flex-direction: column; gap: 0; margin-top: 12px; }
    .qp-row { display: grid; grid-template-columns: 60px 1fr auto auto; align-items: center; gap: 10px;
               padding: 10px 0; border-bottom: 1px solid rgba(108,99,255,.07); }
    .qp-row:last-child { border-bottom: none; }
    .qp-id { font-size: 11px; color: var(--primary); }
    .qp-text { font-size: 13px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .qp-cats { display: flex; gap: 4px; flex-wrap: wrap; }
    .qp-actions { display: flex; gap: 6px; }
    .act { width: 28px; height: 28px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; }
    .act.approve { background: rgba(6,214,160,.15); color: var(--safe); }
    .act.approve:hover { background: rgba(6,214,160,.3); }
    .act.block { background: rgba(255,77,109,.15); color: var(--danger); }
    .act.block:hover { background: rgba(255,77,109,.3); }
    .activity-list { display: flex; flex-direction: column; gap: 0; margin-top: 12px; max-height: 340px; overflow-y: auto; }
    .activity-row { display: flex; align-items: center; gap: 10px; padding: 9px 0;
                    border-bottom: 1px solid rgba(108,99,255,.06); }
    .activity-row:last-child { border-bottom: none; }
    .av-chip { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
               font-size: 11px; font-weight: 700; flex-shrink: 0; text-transform: uppercase; }
    .av-approved { background: rgba(6,214,160,.15); color: var(--safe); }
    .av-blocked  { background: rgba(255,77,109,.15); color: var(--danger); }
    .av-escalated{ background: rgba(255,183,3,.15);  color: var(--warn); }
    .activity-body { flex: 1; min-width: 0; }
    .activity-name { font-size: 12px; font-weight: 600; color: var(--text); }
    .activity-msg  { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .activity-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
    .act-badge { font-size: 9px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
    .act-approved { background: rgba(6,214,160,.15); color: var(--safe); }
    .act-blocked  { background: rgba(255,77,109,.15); color: var(--danger); }
    .act-escalated{ background: rgba(255,183,3,.15);  color: var(--warn); }
    .activity-time { font-size: 10px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
    .btn-ghost { background: none; border: 1px solid rgba(108,99,255,.3); color: var(--primary); font-size: 12px;
                 padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: all .15s; }
    .btn-ghost:hover { background: rgba(108,99,255,.1); }
    @media (max-width: 1200px) { .kpi-row { grid-template-columns: repeat(3, 1fr); } .main-grid { grid-template-columns: 1fr; } }
    @media (max-width: 900px)  { .bottom-grid { grid-template-columns: 1fr; } }
  `]
})
export class OverviewComponent implements OnInit, OnDestroy {
  readonly queueSvc = inject(QueueService);
  private readonly toastSvc = inject(ToastService);
  private readonly api = inject(ApiService);

  ranges: Range[] = ['1H', '24H', '7D', '30D'];
  range = signal<string>('24H');
  chartData = signal<VolumePoint[]>([]);
  summary = signal<any>({ total_24h: 0, flagged_24h: 0, blocked_24h: 0, pending: 0, block_rate: 0 });
  categoryData = signal<any[]>(CATEGORIES);
  recentActivity = signal<any[]>([]);
  latencySpark = [8, 11, 9, 14, 10, 12, 9, 11, 13, 10, 11, 12];

  private _interval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.loadSummary();
    this.loadChart();
    this.loadCategories();
    this.loadActivity();
    this._interval = setInterval(() => {
      this.loadSummary();
      if (this.range() === '1H' || this.range() === '24H') this.loadChart();
    }, 30000);
  }

  ngOnDestroy() { if (this._interval) clearInterval(this._interval); }

  setRange(r: string) { this.range.set(r); this.loadChart(); }

  private loadSummary() {
    this.api.getSummary().subscribe({ next: d => this.summary.set(d) });
  }

  private loadChart() {
    this.api.getVolume(this.range()).subscribe({ next: d => this.chartData.set(d) });
  }

  private loadCategories() {
    this.api.getCategories().subscribe({
      next: data => {
        const max = Math.max(...data.map((d: any) => d.count), 1);
        const mapped = data.map((d: any) => {
          const base = CATEGORIES.find(c => c.id === d.category) || { color: '#6C63FF', name: d.category };
          return { ...base, id: d.category, count: d.count };
        });
        this.categoryData.set(mapped);
      }
    });
  }

  private loadActivity() {
    this.api.getAuditLog().subscribe({ next: d => this.recentActivity.set(d.results?.slice(0, 10) || []) });
  }

  decide(id: string, status: 'approved' | 'blocked') {
    this.queueSvc.decide(id, status);
    this.toastSvc.show(status === 'approved' ? 'approve' : 'block', `Message ${status}`, id);
  }

  approveAll() {
    const n = this.queueSvc.pendingCount();
    this.queueSvc.approveAll();
    this.toastSvc.show('approve', 'Queue cleared', `${n} messages approved`);
  }
}
