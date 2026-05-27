import { Component, input, output, signal } from '@angular/core';
import { QueueMessage } from '../../core/models/sentinel.models';
import { SEV } from '../../core/data/sentinel.data';
import { CatBadgeComponent } from '../../shared/components/cat-badge.component';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CatBadgeComponent],
  template: `
    <div class="review-card" [class.expanded]="expanded()">

      <!-- Header row -->
      <div class="rc-header" (click)="expanded.set(!expanded())">
        <div class="rc-meta">
          <span class="rc-id mono">{{ msg().id }}</span>
          <span class="rc-time mono">{{ timeAgo(msg().ts) }}</span>
        </div>
        <div class="rc-cats">
          @for (c of msg().cats; track c[0]) {
            <app-cat-badge [catKey]="c[0]" [score]="c[1]" />
          }
        </div>
        <div class="rc-conf" [class.high]="msg().conf >= .8">
          {{ (msg().conf * 100).toFixed(0) }}%
        </div>
        <div class="rc-chevron">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
               [style.transform]="expanded() ? 'rotate(90deg)' : ''" style="transition:transform .2s">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </div>
      </div>

      <!-- Message text -->
      <div class="rc-body">
        <div class="rc-text" dir="rtl" lang="ar">{{ msg().ar }}</div>
        <div class="rc-text-en">{{ msg().en }}</div>
      </div>

      <!-- AI Explanation (expanded only) -->
      @if (expanded()) {
        <div class="rc-explain">
          <div class="explain-header">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>
            AceGPT Analysis
          </div>
          <div class="explain-ar" dir="rtl">{{ msg().ar_expl }}</div>
          <div class="explain-en">{{ msg().en_expl }}</div>
          <div class="explain-meta">
            <span>Sender: <span class="mono">{{ msg().sender }}</span></span>
            <span>Recipient: <span class="mono">{{ msg().recipient }}</span></span>
          </div>
        </div>
      }

      <!-- Actions -->
      <div class="rc-actions">
        <button class="rc-btn approve" (click)="onDecide.emit('approved')" [disabled]="msg().status !== 'pending'">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 6"/></svg>
          Approve
        </button>
        <button class="rc-btn block" (click)="onDecide.emit('blocked')" [disabled]="msg().status !== 'pending'">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>
          Block
        </button>
        <button class="rc-btn escalate" (click)="onDecide.emit('escalated')" [disabled]="msg().status !== 'pending'">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14l8-8 8 8"/><path d="M12 6v12"/></svg>
          Escalate
        </button>
        @if (msg().status !== 'pending') {
          <span class="status-chip status-{{ msg().status }}">{{ msg().status }}</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .review-card {
      background: var(--surface); border-radius: 14px; border: 1px solid rgba(108,99,255,.12);
      overflow: hidden; transition: border-color .2s;
    }
    .review-card:hover { border-color: rgba(108,99,255,.28); }
    .review-card.expanded { border-color: rgba(108,99,255,.4); }

    .rc-header {
      display: flex; align-items: center; gap: 12px; padding: 14px 16px;
      cursor: pointer; user-select: none;
    }
    .rc-meta { display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; }
    .rc-id { font-size: 12px; color: var(--primary); font-weight: 600; }
    .rc-time { font-size: 10px; color: var(--muted); }
    .rc-cats { display: flex; gap: 4px; flex-wrap: wrap; flex: 1; }
    .rc-conf { font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--muted); }
    .rc-conf.high { color: var(--danger); }
    .rc-chevron { color: var(--muted); flex-shrink: 0; }

    .rc-body { padding: 0 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .rc-text { font-size: 14px; color: var(--text); line-height: 1.6; font-family: 'Cairo', sans-serif; }
    .rc-text-en { font-size: 12px; color: var(--muted); font-style: italic; }

    .rc-explain {
      margin: 0 16px 12px; padding: 12px; background: rgba(108,99,255,.06);
      border-radius: 10px; border-left: 3px solid var(--primary);
    }
    .explain-header {
      display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
      letter-spacing: .06em; text-transform: uppercase; color: var(--primary); margin-bottom: 8px;
    }
    .explain-ar { font-size: 13px; color: var(--text); line-height: 1.6; font-family: 'Cairo', sans-serif;
                  margin-bottom: 6px; direction: rtl; }
    .explain-en { font-size: 12px; color: var(--muted); font-style: italic; margin-bottom: 10px; }
    .explain-meta { display: flex; gap: 20px; font-size: 11px; color: var(--muted); flex-wrap: wrap; }

    .rc-actions {
      display: flex; gap: 8px; align-items: center; padding: 12px 16px;
      border-top: 1px solid rgba(108,99,255,.08);
    }
    .rc-btn {
      display: flex; align-items: center; gap: 6px; padding: 7px 14px;
      border-radius: 8px; border: none; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all .15s;
    }
    .rc-btn:disabled { opacity: .4; cursor: not-allowed; }
    .rc-btn.approve { background: rgba(6,214,160,.15); color: var(--safe); }
    .rc-btn.approve:not(:disabled):hover { background: rgba(6,214,160,.3); }
    .rc-btn.block { background: rgba(255,77,109,.15); color: var(--danger); }
    .rc-btn.block:not(:disabled):hover { background: rgba(255,77,109,.3); }
    .rc-btn.escalate { background: rgba(255,183,3,.15); color: var(--warn); }
    .rc-btn.escalate:not(:disabled):hover { background: rgba(255,183,3,.3); }

    .status-chip { margin-left: auto; font-size: 10px; font-weight: 700; letter-spacing: .06em;
                   text-transform: uppercase; padding: 3px 8px; border-radius: 6px; }
    .status-approved { background: rgba(6,214,160,.15); color: var(--safe); }
    .status-blocked { background: rgba(255,77,109,.15); color: var(--danger); }
    .status-escalated { background: rgba(255,183,3,.15); color: var(--warn); }
  `]
})
export class ReviewCardComponent {
  msg = input.required<QueueMessage>();
  onDecide = output<'approved' | 'blocked' | 'escalated'>();
  expanded = signal(false);

  timeAgo(ts: number): string {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    return Math.floor(s / 3600) + 'h ago';
  }
}
