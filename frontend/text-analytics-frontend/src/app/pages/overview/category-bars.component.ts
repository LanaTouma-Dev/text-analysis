import { Component, input, computed } from '@angular/core';
import { Category } from '../../core/models/sentinel.models';

@Component({
  selector: 'app-category-bars',
  standalone: true,
  template: `
    <div class="cat-bar-list">
      @for (cat of sorted(); track cat.id) {
        <div class="cat-bar-row">
          <div class="cat-label" [title]="cat.name">{{ cat.name }}</div>
          <div class="cat-track">
            <div class="cat-fill" [style.width.%]="pct(cat.count)" [style.background]="cat.color"></div>
          </div>
          <div class="cat-count">{{ cat.count.toLocaleString() }}</div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cat-bar-list { display: flex; flex-direction: column; gap: 10px; }
    .cat-bar-row { display: grid; grid-template-columns: 160px 1fr 56px; align-items: center; gap: 10px; }
    .cat-label { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cat-track { height: 6px; background: rgba(108,99,255,.1); border-radius: 3px; overflow: hidden; }
    .cat-fill { height: 100%; border-radius: 3px; transition: width .6s cubic-bezier(.4,0,.2,1); }
    .cat-count { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--text); text-align: right; }
  `]
})
export class CategoryBarsComponent {
  categories = input<Category[]>([]);

  sorted = computed(() => [...this.categories()].sort((a, b) => b.count - a.count));

  pct(count: number): number {
    const max = this.sorted()[0]?.count || 1;
    return (count / max) * 100;
  }
}
