import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AUDIT_ENTRIES } from '../../core/data/sentinel.data';

type AuditAction = 'ALL' | 'BLOCK' | 'APPROVE' | 'ESCALATE';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-root">

      <div class="page-header">
        <div>
          <h1 class="page-title">Audit Log</h1>
          <p class="page-sub">Immutable record of all moderation actions</p>
        </div>
        <button class="export-btn">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      <!-- Filters -->
      <div class="filter-row card" style="padding:14px 16px">
        <div class="filter-tabs">
          @for (a of actions; track a) {
            <button [class.active]="actionFilter() === a" (click)="actionFilter.set(a)">{{ a }}</button>
          }
        </div>
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input class="search-input" placeholder="Search ID, moderator…" [(ngModel)]="searchRaw" />
        </div>
      </div>

      <!-- Log table -->
      <div class="card" style="padding:0;overflow:hidden">
        <div class="audit-head">
          <span style="width:80px">Time</span>
          <span style="width:40px">Who</span>
          <span style="width:90px">Action</span>
          <span style="width:110px">Message ID</span>
          <span style="width:140px">Category</span>
          <span style="flex:1">Reason</span>
          <span style="width:110px">IP Address</span>
        </div>
        <div class="audit-rows">
          @for (e of visible(); track $index) {
            <div class="audit-row">
              <span class="col-t mono">{{ e.t }}</span>
              <div class="av-chip av-{{ e.act.toLowerCase() }}">{{ e.who }}</div>
              <span class="act-badge act-{{ e.act.toLowerCase() }}">{{ e.act }}</span>
              <span class="col-id mono">{{ e.id }}</span>
              <span class="col-cat">{{ e.cat }}</span>
              <span class="col-reason">{{ e.reason }}</span>
              <span class="col-ip mono">{{ e.ip }}</span>
            </div>
          }
          @if (visible().length === 0) {
            <div class="empty-state" style="padding:40px 0">
              <div style="font-size:30px">🔍</div>
              <div class="empty-title" style="margin-top:10px;font-size:14px">No matching entries</div>
            </div>
          }
        </div>
      </div>

      <div class="log-footer">
        Showing {{ visible().length }} of {{ entries.length }} entries · All times UTC+3 (Damascus)
      </div>

    </div>
  `,
  styles: [`
    .page-root { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .page-title { font-size: 22px; font-weight: 700; color: var(--text); margin: 0; }
    .page-sub { font-size: 13px; color: var(--muted); margin: 4px 0 0; }

    .export-btn { display: flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 10px;
                  border: 1px solid rgba(108,99,255,.3); background: none; color: var(--primary);
                  font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
    .export-btn:hover { background: rgba(108,99,255,.1); }

    .filter-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; }
    .filter-tabs button { background: none; border: none; color: var(--muted); padding: 6px 12px; border-radius: 8px;
                           font-size: 12px; cursor: pointer; transition: all .15s; }
    .filter-tabs button:hover { color: var(--text); background: rgba(108,99,255,.08); }
    .filter-tabs button.active { background: rgba(108,99,255,.18); color: var(--text); font-weight: 600; }

    .search-wrap { display: flex; align-items: center; gap: 8px; background: rgba(108,99,255,.07);
                   border-radius: 8px; padding: 6px 12px; margin-left: auto; }
    .search-input { background: none; border: none; outline: none; color: var(--text); font-size: 13px; width: 180px; }
    .search-input::placeholder { color: var(--muted); }

    .audit-head { display: flex; align-items: center; gap: 12px; padding: 10px 16px;
                  background: rgba(108,99,255,.06); border-bottom: 1px solid rgba(108,99,255,.1);
                  font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
    .audit-rows { max-height: calc(100vh - 320px); overflow-y: auto; }
    .audit-row { display: flex; align-items: center; gap: 12px; padding: 10px 16px;
                 border-bottom: 1px solid rgba(108,99,255,.05); transition: background .1s; }
    .audit-row:hover { background: rgba(108,99,255,.04); }
    .audit-row:last-child { border-bottom: none; }

    .col-t { width: 80px; flex-shrink: 0; font-size: 12px; color: var(--muted); }
    .av-chip { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
               font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .av-approve { background: rgba(6,214,160,.15); color: var(--safe); }
    .av-block { background: rgba(255,77,109,.15); color: var(--danger); }
    .av-escalate { background: rgba(255,183,3,.15); color: var(--warn); }
    .act-badge { flex-shrink: 0; width: 90px; font-size: 9px; font-weight: 700; letter-spacing: .06em;
                 text-transform: uppercase; padding: 3px 8px; border-radius: 5px; text-align: center; }
    .act-approve { background: rgba(6,214,160,.12); color: var(--safe); }
    .act-block { background: rgba(255,77,109,.12); color: var(--danger); }
    .act-escalate { background: rgba(255,183,3,.12); color: var(--warn); }
    .col-id { width: 110px; flex-shrink: 0; font-size: 11px; color: var(--primary); }
    .col-cat { width: 140px; flex-shrink: 0; font-size: 12px; color: var(--text); }
    .col-reason { flex: 1; font-size: 12px; color: var(--muted); }
    .col-ip { width: 110px; flex-shrink: 0; font-size: 11px; color: var(--muted); }

    .log-footer { font-size: 12px; color: var(--muted); text-align: center; padding: 8px 0; }
    .empty-state { text-align: center; color: var(--muted); }
    .empty-title { font-size: 14px; color: var(--text); }
  `]
})
export class AuditComponent {
  entries = AUDIT_ENTRIES;
  actions: AuditAction[] = ['ALL', 'BLOCK', 'APPROVE', 'ESCALATE'];
  actionFilter = signal<AuditAction>('ALL');
  searchRaw = '';

  visible = computed(() => {
    const f = this.actionFilter();
    const s = this.searchRaw.toLowerCase().trim();
    return this.entries
      .filter(e => f === 'ALL' || e.act === f)
      .filter(e => !s || e.id.toLowerCase().includes(s) || e.who.toLowerCase().includes(s) || e.reason.toLowerCase().includes(s));
  });
}
