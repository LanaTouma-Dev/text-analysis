import { Injectable, signal } from '@angular/core';

type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly LS_KEY = 'sentinel-theme';

  readonly theme = signal<Theme>(this._load());

  constructor() {
    this._apply(this.theme());
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this._apply(next);
    localStorage.setItem(this.LS_KEY, next);
  }

  isDark() { return this.theme() === 'dark'; }

  private _load(): Theme {
    const stored = localStorage.getItem(this.LS_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
    // respect OS preference on first visit
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  private _apply(t: Theme): void {
    document.documentElement.classList.toggle('light', t === 'light');
  }
}
