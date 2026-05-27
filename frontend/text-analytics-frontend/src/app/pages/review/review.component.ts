import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QueueService } from '../../core/services/queue.service';
import { ToastService } from '../../core/services/toast.service';
import { MessageStatus } from '../../core/models/sentinel.models';
import { ReviewCardComponent } from './review-card.component';

type FilterTab = 'all' | 'pending' | 'approved' | 'blocked' | 'escalated';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [ReviewCardComponent, FormsModule],
  template: `
    <div class="page-root">

      <!-- Page header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Review Queue</h1>
          <p class="page-sub">AI-flagged messages awaiting human moderation</p>
        </div>
        <div class="header-actions">
          <div class="kbd-hint">
            <kbd>A</kbd> Approve&nbsp;&nbsp;<kbd>B</kbd> Block&nbsp;&nbsp;<kbd>E</kbd> Escalate&nbsp;&nbsp;<kbd>↑↓</kbd> Navigate
          </div>
          <button class="btn-primary" (click)="approveAll()" [disabled]="queueSvc.pendingCount() === 0">
            Approve All Pending ({{ queueSvc.pendingCount() }})
          </button>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar">
        @for (tab of tabs; track tab.id) {
          <button [class.active]="filter() === tab.id" (click)="filter.set(tab.id)">
            {{ tab.label }}
            <span class="tab-count">{{ tabCount(tab.id) }}</span>
          </button>
        }
        <div style="flex:1"></div>
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input class="search-input" placeholder="Search by ID or text…" [(ngModel)]="searchRaw" />
        </div>
      </div>

      <!-- Card list -->
      <div class="card-list">
        @for (msg of visible(); track msg.id) {
          <app-review-card [msg]="msg" (onDecide)="decide(msg.id, $event)" />
        }
        @if (visible().length === 0) {
          <div class="empty-state">
            <div style="font-size:40px">📭</div>
            <div class="empty-title">No messages</div>
            <div class="empty-sub">Nothing matches your current filter</div>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .page-root { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .page-title { font-size: 22px; font-weight: 700; color: var(--text); margin: 0; }
    .page-sub { font-size: 13px; color: var(--muted); margin: 4px 0 0; }
    .header-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

    .kbd-hint { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    kbd { background: rgba(108,99,255,.15); color: var(--primary); border-radius: 4px;
          padding: 2px 5px; font-size: 11px; font-family: 'JetBrains Mono', monospace; }

    .btn-primary { background: var(--primary); color: #fff; border: none; padding: 9px 18px; border-radius: 10px;
                   font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
    .btn-primary:hover:not(:disabled) { background: var(--primary-2); }
    .btn-primary:disabled { opacity: .4; cursor: not-allowed; }

    .filter-bar { display: flex; align-items: center; gap: 4px; background: var(--surface);
                  border-radius: 12px; padding: 6px; border: 1px solid rgba(108,99,255,.1); flex-wrap: wrap; }
    .filter-bar button { background: none; border: none; color: var(--muted); padding: 7px 14px; border-radius: 8px;
                          font-size: 13px; cursor: pointer; transition: all .15s; display: flex; align-items: center; gap: 6px; }
    .filter-bar button:hover { color: var(--text); background: rgba(108,99,255,.08); }
    .filter-bar button.active { background: rgba(108,99,255,.18); color: var(--text); font-weight: 600; }
    .tab-count { font-size: 10px; background: rgba(108,99,255,.2); color: var(--primary);
                 border-radius: 10px; padding: 1px 6px; font-family: 'JetBrains Mono', monospace; }

    .search-wrap { display: flex; align-items: center; gap: 8px; background: rgba(108,99,255,.07);
                   border-radius: 8px; padding: 6px 12px; }
    .search-input { background: none; border: none; outline: none; color: var(--text); font-size: 13px; width: 200px; }
    .search-input::placeholder { color: var(--muted); }

    .card-list { display: flex; flex-direction: column; gap: 10px; }

    .empty-state { text-align: center; padding: 60px 0; color: var(--muted); }
    .empty-title { font-size: 16px; font-weight: 600; color: var(--text); margin-top: 12px; }
    .empty-sub { font-size: 13px; margin-top: 4px; }
  `]
})
export class ReviewComponent {
  readonly queueSvc = inject(QueueService);
  private readonly toastSvc = inject(ToastService);

  filter = signal<FilterTab>('all');
  searchRaw = '';

  tabs: { id: FilterTab; label: string }[] = [
    { id: 'all',       label: 'All' },
    { id: 'pending',   label: 'Pending' },
    { id: 'approved',  label: 'Approved' },
    { id: 'blocked',   label: 'Blocked' },
    { id: 'escalated', label: 'Escalated' },
  ];

  visible = computed(() => {
    const q = this.queueSvc.queue();
    const f = this.filter();
    const s = this.searchRaw.toLowerCase().trim();
    return q
      .filter(m => f === 'all' || m.status === f)
      .filter(m => !s || m.id.toLowerCase().includes(s) || m.ar.includes(s) || m.en.toLowerCase().includes(s));
  });

  tabCount(tab: FilterTab): number {
    const q = this.queueSvc.queue();
    if (tab === 'all') return q.length;
    return q.filter(m => m.status === tab).length;
  }

  decide(id: string, status: 'approved' | 'blocked' | 'escalated') {
    this.queueSvc.decide(id, status as MessageStatus);
    const labels: Record<string, string> = { approved: 'Approved', blocked: 'Blocked', escalated: 'Escalated' };
    const kinds: Record<string, 'approve' | 'block' | 'escalate'> = { approved: 'approve', blocked: 'block', escalated: 'escalate' };
    this.toastSvc.show(kinds[status], labels[status], id);
  }

  approveAll() {
    const n = this.queueSvc.pendingCount();
    this.queueSvc.approveAll();
    this.toastSvc.show('approve', 'Queue cleared', `${n} messages approved`);
  }
}
