import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-spark-bars',
  standalone: true,
  template: `
    <div class="spark-bars">
      @for (v of values(); track $index) {
        <div class="spark-bar" [style.height.%]="pct(v)" [style.opacity]="opacity($index)"></div>
      }
    </div>
  `,
  styles: [`
    .spark-bars {
      display: flex; align-items: flex-end; gap: 2px;
      height: 32px; width: 72px;
    }
    .spark-bar {
      flex: 1; background: var(--primary); border-radius: 1px 1px 0 0;
      transition: height .4s ease;
      min-height: 3px;
    }
  `]
})
export class SparkBarsComponent {
  values = input<number[]>([]);

  private _max = computed(() => Math.max(...this.values(), 1));

  pct(v: number): number {
    return (v / this._max()) * 100;
  }

  opacity(i: number): number {
    const len = this.values().length;
    return 0.35 + 0.65 * (i / Math.max(len - 1, 1));
  }
}
