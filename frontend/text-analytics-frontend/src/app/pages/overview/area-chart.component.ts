import { Component, ElementRef, input, OnInit, OnDestroy, signal, ViewChild, AfterViewInit } from '@angular/core';
import { VolumePoint, HoverPoint } from '../../core/models/sentinel.models';

@Component({
  selector: 'app-area-chart',
  standalone: true,
  template: `
    <div #container style="position:relative" (mousemove)="onMove($event)" (mouseleave)="hover.set(null)">
      <svg class="chart-svg" [attr.viewBox]="viewBox()" preserveAspectRatio="none" [style.height.px]="height()">
        <defs>
          <linearGradient id="g-safe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#06D6A0" stop-opacity=".55"/>
            <stop offset="100%" stop-color="#06D6A0" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="g-flagged" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FFB703" stop-opacity=".55"/>
            <stop offset="100%" stop-color="#FFB703" stop-opacity="0"/>
          </linearGradient>
        </defs>

        <!-- Grid lines -->
        @for (g of gridLines(); track g.v) {
          <g>
            <line [attr.x1]="padL" [attr.x2]="w() - padR" [attr.y1]="yAt(g.v)" [attr.y2]="yAt(g.v)"
                  stroke="rgba(108,99,255,.08)" stroke-width="1"/>
            <text [attr.x]="padL - 8" [attr.y]="yAt(g.v) + 3" fill="#6E6B97" font-size="10"
                  text-anchor="end" font-family="JetBrains Mono">{{ g.label }}</text>
          </g>
        }

        <!-- X labels -->
        @for (xl of xLabels(); track xl.i) {
          <text [attr.x]="xAt(xl.i)" [attr.y]="height() - 8" fill="#6E6B97" font-size="10"
                text-anchor="middle" font-family="JetBrains Mono">{{ xl.label }}</text>
        }

        <!-- Safe area -->
        <g style="animation:fadeIn .8s ease both">
          <path [attr.d]="safeArea()" fill="url(#g-safe)"/>
          <path [attr.d]="safePath()" fill="none" stroke="#06D6A0" stroke-width="2"/>
        </g>

        <!-- Flagged area -->
        <g style="animation:fadeIn 1s .15s ease both">
          <path [attr.d]="flaggedArea()" fill="url(#g-flagged)"/>
          <path [attr.d]="flaggedPath()" fill="none" stroke="#FFB703" stroke-width="2"/>
        </g>

        <!-- Hover elements -->
        @if (hover(); as h) {
          <g>
            <line [attr.x1]="h.x" [attr.x2]="h.x" [attr.y1]="padT" [attr.y2]="innerBottom()"
                  stroke="rgba(108,99,255,.5)" stroke-dasharray="3 3"/>
            <circle [attr.cx]="h.x" [attr.cy]="yAt(data()[h.idx].safe)" r="5" fill="#0F0C29" stroke="#06D6A0" stroke-width="2"/>
            <circle [attr.cx]="h.x" [attr.cy]="yAt(data()[h.idx].flagged)" r="5" fill="#0F0C29" stroke="#FFB703" stroke-width="2"/>
          </g>
        }
      </svg>

      @if (hover(); as h) {
        <div class="tooltip"
             [style.left]="(h.x / w() * 100) + '%'"
             [style.top]="(yAt(data()[h.idx].safe) / height() * 100) + '%'">
          <div class="t-time">{{ data()[h.idx].label }}</div>
          <div class="t-row" style="margin-bottom:4px">
            <span class="sw" style="background:#06D6A0"></span>
            <span class="muted">Safe</span>
            <span class="v mono" style="margin-left:auto">{{ data()[h.idx].safe.toLocaleString() }}</span>
          </div>
          <div class="t-row">
            <span class="sw" style="background:#FFB703"></span>
            <span class="muted">Flagged</span>
            <span class="v mono" style="margin-left:auto">{{ data()[h.idx].flagged.toLocaleString() }}</span>
          </div>
        </div>
      }
    </div>
  `
})
export class AreaChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  data = input<VolumePoint[]>([]);
  height = input<number>(280);

  hover = signal<HoverPoint | null>(null);
  private _w = signal(720);

  w() { return this._w(); }

  readonly padL = 44; readonly padR = 14; readonly padT = 14; readonly padB = 28;
  get innerH() { return this.height() - this.padT - this.padB; }
  innerBottom() { return this.padT + this.innerH; }

  private ro: ResizeObserver | null = null;

  ngAfterViewInit() {
    this.ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w > 0) this._w.set(w);
    });
    this.ro.observe(this.containerRef.nativeElement);
  }
  ngOnDestroy() { this.ro?.disconnect(); }

  viewBox() { return `0 0 ${this._w()} ${this.height()}`; }

  yMax() {
    const max = Math.max(...this.data().map(d => d.safe));
    return Math.ceil(max * 1.1 / 1000) * 1000 || 1000;
  }

  xAt(i: number) { return this.padL + (i * Math.max(50, this._w() - this.padL - this.padR)) / Math.max(1, this.data().length - 1); }
  yAt(v: number) { return this.padT + this.innerH - (v / this.yMax()) * this.innerH; }

  gridLines() {
    const ticks = 4;
    const ym = this.yMax();
    return Array.from({ length: ticks + 1 }, (_, i) => {
      const v = (ym * i) / ticks;
      return { v, label: v >= 1000 ? (v / 1000).toFixed(0) + 'k' : String(v) };
    });
  }

  xLabels() {
    const d = this.data();
    const everyN = Math.ceil(d.length / 8);
    return d.map((p, i) => (i % everyN === 0 || i === d.length - 1) ? { i, label: p.label } : null).filter(Boolean) as { i: number; label: string }[];
  }

  safePath() {
    return this.data().map((d, i) => `${i === 0 ? 'M' : 'L'}${this.xAt(i)},${this.yAt(d.safe)}`).join(' ');
  }
  safeArea() {
    const d = this.data();
    return this.safePath() + ` L${this.xAt(d.length - 1)},${this.innerBottom()} L${this.xAt(0)},${this.innerBottom()} Z`;
  }
  flaggedPath() {
    return this.data().map((d, i) => `${i === 0 ? 'M' : 'L'}${this.xAt(i)},${this.yAt(d.flagged)}`).join(' ');
  }
  flaggedArea() {
    const d = this.data();
    return this.flaggedPath() + ` L${this.xAt(d.length - 1)},${this.innerBottom()} L${this.xAt(0)},${this.innerBottom()} Z`;
  }

  onMove(e: MouseEvent) {
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const innerW = Math.max(50, this._w() - this.padL - this.padR);
    const idx = Math.round(((x - this.padL) / innerW) * (this.data().length - 1));
    if (idx >= 0 && idx < this.data().length) {
      this.hover.set({ idx, x: this.xAt(idx), y: this.yAt(this.data()[idx].safe) });
    }
  }
}
