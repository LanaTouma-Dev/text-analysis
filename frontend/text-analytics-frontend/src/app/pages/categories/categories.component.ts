import { Component } from '@angular/core';
import { CATEGORIES, SEV } from '../../core/data/sentinel.data';
import { CatBadgeComponent } from '../../shared/components/cat-badge.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CatBadgeComponent],
  template: `
    <div class="page-root">

      <div class="page-header">
        <div>
          <h1 class="page-title">Categories</h1>
          <p class="page-sub">10 moderation categories · MARBERT multi-label classifier</p>
        </div>
      </div>

      <!-- Summary bar -->
      <div class="summary-bar card">
        <div class="sum-item">
          <div class="sum-label">Total Flagged (30d)</div>
          <div class="sum-val">{{ total().toLocaleString() }}</div>
        </div>
        <div class="sum-divider"></div>
        <div class="sum-item">
          <div class="sum-label">Danger Categories</div>
          <div class="sum-val" style="color:var(--danger)">{{ dangerCount }}</div>
        </div>
        <div class="sum-divider"></div>
        <div class="sum-item">
          <div class="sum-label">Amber Categories</div>
          <div class="sum-val" style="color:var(--warn)">{{ amberCount }}</div>
        </div>
        <div class="sum-divider"></div>
        <div class="sum-item">
          <div class="sum-label">Highest Risk</div>
          <div style="margin-top:4px"><app-cat-badge catKey="hate" [score]="0.94" /></div>
        </div>
      </div>

      <!-- Category cards -->
      <div class="cat-grid">
        @for (cat of categories; track cat.id) {
          <div class="cat-card card">
            <div class="cc-top">
              <div class="cc-swatch" [style.background]="cat.color + '22'" [style.border-color]="cat.color + '66'">
                <div class="cc-dot" [style.background]="cat.color"></div>
              </div>
              <div class="cc-sev" [class.danger]="sev(cat.id) === 'danger'" [class.amber]="sev(cat.id) === 'amber'">
                {{ sev(cat.id) === 'danger' ? '⚠ High Risk' : '● Medium Risk' }}
              </div>
            </div>
            <div class="cc-name">{{ cat.name }}</div>
            <div class="cc-count">{{ cat.count.toLocaleString() }}</div>
            <div class="cc-label">flags last 30 days</div>
            <div class="cc-bar-track">
              <div class="cc-bar-fill" [style.width.%]="pct(cat.count)" [style.background]="cat.color"></div>
            </div>
            <div class="cc-threshold">
              <span class="cc-th-label">Confidence threshold</span>
              <span class="cc-th-val mono">0.70</span>
            </div>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .page-root { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-title { font-size: 22px; font-weight: 700; color: var(--text); margin: 0; }
    .page-sub { font-size: 13px; color: var(--muted); margin: 4px 0 0; }

    .summary-bar { display: flex; align-items: center; padding: 20px 24px; gap: 0; flex-wrap: wrap; }
    .sum-item { padding: 0 24px; }
    .sum-item:first-child { padding-left: 0; }
    .sum-label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 4px; }
    .sum-val { font-size: 24px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }
    .sum-divider { width: 1px; height: 40px; background: rgba(108,99,255,.15); flex-shrink: 0; }

    .cat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }

    .cat-card { padding: 18px; display: flex; flex-direction: column; gap: 8px; }
    .cc-top { display: flex; align-items: center; justify-content: space-between; }
    .cc-swatch { width: 36px; height: 36px; border-radius: 10px; border: 1px solid;
                 display: flex; align-items: center; justify-content: center; }
    .cc-dot { width: 14px; height: 14px; border-radius: 50%; }
    .cc-sev { font-size: 10px; font-weight: 700; letter-spacing: .04em; padding: 3px 7px; border-radius: 6px; }
    .cc-sev.danger { background: rgba(255,77,109,.12); color: var(--danger); }
    .cc-sev.amber { background: rgba(255,183,3,.12); color: var(--warn); }
    .cc-name { font-size: 14px; font-weight: 600; color: var(--text); margin-top: 4px; line-height: 1.3; }
    .cc-count { font-size: 26px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }
    .cc-label { font-size: 10px; color: var(--muted); margin-top: -4px; }
    .cc-bar-track { height: 4px; background: rgba(108,99,255,.1); border-radius: 2px; overflow: hidden; margin-top: 4px; }
    .cc-bar-fill { height: 100%; border-radius: 2px; transition: width .8s ease; }
    .cc-threshold { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
    .cc-th-label { font-size: 10px; color: var(--muted); }
    .cc-th-val { font-size: 11px; color: var(--primary); }

    @media (max-width: 1200px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 800px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class CategoriesComponent {
  categories = CATEGORIES;
  dangerCount = Object.values(SEV).filter(v => v === 'danger').length;
  amberCount = Object.values(SEV).filter(v => v === 'amber').length;

  total(): number { return CATEGORIES.reduce((s, c) => s + c.count, 0); }

  pct(count: number): number {
    return (count / CATEGORIES[0].count) * 100;
  }

  sev(id: string) { return SEV[id]; }
}
