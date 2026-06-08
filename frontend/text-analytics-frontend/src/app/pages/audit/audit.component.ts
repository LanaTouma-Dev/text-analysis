import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

type AuditAction = 'ALL' | 'blocked' | 'approved' | 'escalated';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [FormsModule, DatePipe, SlicePipe],
  template: `
    <div class="page-root">

      <div class="page-header">
        <div>
          <h1 class="page-title">Audit Log</h1>
          <p class="page-sub">Immutable record of all moderation actions</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-row card" style="padding:14px 16px">
        <div class="filter-tabs">
          @for (a of actions; track a) {
            <button [class.active]="actionFilter() === a" (click)="setFilter(a)">{{ a.toUpperCase() }}</button>
          }
        </div>
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input class="search-input" placeholder="Search moderator, message…" [(ngModel)]="searchRaw" />
        </div>
      </div>

      <!-- Log table -->
      <div class="card" style="padding:0;overflow:hidden">
        <div class="audit-head">
          <span style="width:120px">Time</span>
          <span style="width:40px">Who</span>
          <span style="width:100px">Action</span>
          <span style="width:80px">Msg ID</span>
          <span style="flex:1">Message</span>
          <span style="width:110px">IP Address</span>
        </div>
        <div class="audit-rows">
          @if (loading()) {
            <div style="padding:40px;text-align:center;color:var(--muted)">Loading…</div>
          }
          @for (e of visible(); track e.id) {
            <div class="audit-row">
              <span class="col-t mono">{{ e.created_at | date:'dd/MM HH:mm:ss' }}</span>
              <div class="av-chip av-{{ e.action }}">{{ e.moderator_name | slice:0:2 }}</div>
              <span class="act-badge act-{{ e.action }}">{{ e.action }}</span>
              <span class="col-id mono">{{ e.message_id }}</span>
              <span class="col-reason" dir="rtl">{{ e.message_body }}</span>
              <span class="col-ip mono">{{ e.ip_address || '—' }}</span>
            </div>
          }
          @if (!loading() && visible().length === 0) {
            <div class="empty-state" style="padding:40px 0">
              <div style="font-size:30px">🔍</div>
              <div style="margin-top:10px;font-size:14px;color:var(--text)">No matching entries</div>
            </div>
          }
        </div>
      </div>

      <div class="log-footer">
        Showing {{ visible().length }} entries
      </div>

    </div>
  `,
  styles: [`
    .page-root { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .page-title { font-size: 22px; font-weight: 700; color: var(--text); margin: 0; }
    .page-sub { font-size: 13px; color: var(--muted); margin: 4px 0 0; }
    .filter-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; }
    .filter-tabs button { background: none; border: none; color: var(--muted); padding: 6px 12px; border-radius: 8px;
                          font-size: 12px; cursor: pointer; transition: all .15s; }
    .filter-tabs button:hover { color: var(--text); background: rgba(108,99,255,.08); }
    .filter-tabs button.active { background: rgba(108,99,255,.18); color: var(--text); font-weight: 600; }
    .search-wrap { display: flex; align-items: center; gap: 8px; background: rgba(108,99,255,.07);
                   border-radius: 8px; padding: 6px 12px; margin-left: auto; }
    .search-input { background: none; border: none; outline: none; color: var(--text); font-size: 13px; width: 200px; }
    .search-input::placeholder { color: var(--muted); }
    .audit-head { display: flex; align-items: center; gap: 12px; padding: 10px 16px;
                  background: rgba(108,99,255,.06); border-bottom: 1px solid rgba(108,99,255,.1);
                  font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
    .audit-rows { max-height: calc(100vh - 320px); overflow-y: auto; }
    .audit-row { display: flex; align-items: center; gap: 12px; padding: 10px 16px;
                 border-bottom: 1px solid rgba(108,99,255,.05); transition: background .1s; }
    .audit-row:hover { background: rgba(108,99,255,.04); }
    .audit-row:last-child { border-bottom: none; }
    .col-t { width: 120px; flex-shrink: 0; font-size: 11px; color: var(--muted); }
    .av-chip { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
               font-size: 10px; font-weight: 700; flex-shrink: 0; text-transform: uppercase; }
    .av-approved  { background: rgba(6,214,160,.15);  color: var(--safe); }
    .av-blocked   { background: rgba(255,77,109,.15);  color: var(--danger); }
    .av-escalated { background: rgba(255,183,3,.15);   color: var(--warn); }
    .act-badge { flex-shrink: 0; width: 100px; font-size: 9px; font-weight: 700; letter-spacing: .06em;
                 text-transform: uppercase; padding: 3px 8px; border-radius: 5px; text-align: center; }
    .act-approved  { background: rgba(6,214,160,.12);  color: var(--safe); }
    .act-blocked   { background: rgba(255,77,109,.12);  color: var(--danger); }
    .act-escalated { background: rgba(255,183,3,.12);   color: var(--warn); }
    .col-id { width: 80px; flex-shrink: 0; font-size: 11px; color: var(--primary); }
    .col-reason { flex: 1; font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .col-ip { width: 110px; flex-shrink: 0; font-size: 11px; color: var(--muted); }
    .log-footer { font-size: 12px; color: var(--muted); text-align: center; padding: 8px 0; }
    .empty-state { text-align: center; color: var(--muted); }
  `]
})
export class AuditComponent implements OnInit {
  private api = inject(ApiService);

  actions: AuditAction[] = ['ALL' as any, 'approved', 'blocked', 'escalated'];
  actionFilter = signal<AuditAction>('ALL' as any);
  searchRaw = '';
  loading = signal(true);
  entries = signal<any[]>([]);

  visible = computed(() => {
    const f = this.actionFilter();
    const s = this.searchRaw.toLowerCase().trim();
    return this.entries()
      .filter(e => (f as string) === 'ALL' || e.action === f)
      .filter(e => !s ||
        e.moderator_name?.toLowerCase().includes(s) ||
        e.message_body?.toLowerCase().includes(s) ||
        String(e.message_id).includes(s)
      );
  });

  ngOnInit() { this.load(); }

  setFilter(f: AuditAction) { this.actionFilter.set(f); }

  private load() {
    this.loading.set(true);
    this.api.getAuditLog().subscribe({
      next: d => { this.entries.set(d.results || []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
