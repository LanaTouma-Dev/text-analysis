import { Component, input, OnChanges, signal } from '@angular/core';

@Component({
  selector: 'app-count-up',
  standalone: true,
  template: `{{ prefix() }}{{ display() }}{{ suffix() }}`
})
export class CountUpComponent implements OnChanges {
  value    = input<number>(0);
  duration = input<number>(700);
  prefix   = input<string>('');
  suffix   = input<string>('');
  decimals = input<number>(0);

  private _display = signal('0');
  display() { return this._display(); }

  ngOnChanges(): void {
    let raf: number;
    let start: number | null = null;
    const target = this.value();
    const dur    = this.duration();

    const tick = (t: number) => {
      if (start == null) start = t;
      const p      = Math.min(1, (t - start) / dur);
      const eased  = 1 - Math.pow(1 - p, 3);
      const v      = target * eased;
      this._display.set(
        this.decimals() > 0 ? v.toFixed(this.decimals()) : Math.round(v).toLocaleString()
      );
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
}
