import { Component, OnDestroy, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CURRENT_USER } from '../../core/data/sentinel.data';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

const CRUMBS: Record<string, [string, string]> = {
  overview:   ['Dashboard',  'Overview'],
  review:     ['Moderation', 'Review Queue'],
  feed:       ['Moderation', 'Live Message Feed'],
  analytics:  ['Insights',   'Analytics'],
  categories: ['Insights',   'Categories'],
  audit:      ['System',     'Audit Log'],
  settings:   ['System',     'Settings'],
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <!-- Breadcrumb -->
      <div class="crumb">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></svg>
        <span>{{ crumb()[0] }}</span>
        <span class="sep">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </span>
        <span class="now">{{ crumb()[1] }}</span>
      </div>

      <div class="spacer"></div>

      <!-- Clock -->
      <div class="clock" title="Live server time (Damascus, UTC+3)">
        <span class="dot"></span>
        <span>{{ dateStr() }}</span>
        <span style="opacity:.5">·</span>
        <span style="color:var(--text);font-weight:600">{{ timeStr() }}</span>
        <span style="opacity:.5">DAM</span>
      </div>

      <!-- Theme toggle -->
      <button class="icon-btn theme-btn" (click)="themeSvc.toggle()"
              [title]="themeSvc.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
        @if (themeSvc.isDark()) {
          <!-- Sun icon -->
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
          </svg>
        } @else {
          <!-- Moon icon -->
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        }
      </button>

      <!-- Search -->
      <button class="icon-btn" title="Search (⌘K)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      </button>

      <!-- Notifications -->
      <button class="icon-btn" title="Notifications">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>
        <span class="dot-count">4</span>
      </button>

      <!-- User -->
      <div class="me" title="Profile">
        <div class="avatar">{{ user.initials }}</div>
        <div>
          <div class="name">{{ user.name }}</div>
          <div class="role">{{ user.role }}</div>
        </div>
      </div>

      <!-- Logout -->
      <button class="icon-btn" title="Sign out" (click)="logout()">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </header>
  `
})
export class TopbarComponent implements OnInit, OnDestroy {
  router    = inject(Router);
  themeSvc  = inject(ThemeService);
  auth      = inject(AuthService);
  user      = CURRENT_USER;

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private _now      = signal(new Date());
  private _interval: ReturnType<typeof setInterval> | null = null;

  ngOnInit()    { this._interval = setInterval(() => this._now.set(new Date()), 1000); }
  ngOnDestroy() { if (this._interval) clearInterval(this._interval); }

  crumb(): [string, string] {
    const path = this.router.url.replace('/', '').split('/')[0] || 'overview';
    return CRUMBS[path] || ['Dashboard', 'Overview'];
  }

  dateStr() {
    return this._now().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }
  timeStr() { return this._now().toTimeString().slice(0, 8); }
}
