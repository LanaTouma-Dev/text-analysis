import { Component, input } from '@angular/core';
import { getCategoryById, SEV } from '../../core/data/sentinel.data';

@Component({
  selector: 'app-cat-badge',
  standalone: true,
  template: `
    <span [class]="'tag ' + cls()">
      <span>{{ label() }}</span>
      @if (score() != null) {
        <span class="score">{{ score()!.toFixed(2) }}</span>
      }
    </span>
  `
})
export class CatBadgeComponent {
  catKey = input<string>('');
  score  = input<number | null>(null);
  tone   = input<string>('');
  name   = input<string>('');

  label() {
    return this.name() || getCategoryById(this.catKey())?.name || this.catKey();
  }

  cls() {
    if (this.tone()) return this.tone();
    const sev = SEV[this.catKey()] || 'amber';
    return sev === 'danger' ? 'tag-danger' : sev === 'amber' ? 'tag-amber' : 'tag-violet';
  }
}
