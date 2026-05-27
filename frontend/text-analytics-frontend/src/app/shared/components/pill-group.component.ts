import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pill-group',
  standalone: true,
  template: `
    <div class="pillgroup">
      @for (opt of options(); track opt) {
        <button [class.on]="opt === value()" (click)="onChange.emit(opt)">{{ opt }}</button>
      }
    </div>
  `
})
export class PillGroupComponent {
  options = input<string[]>([]);
  value = input<string>('');
  onChange = output<string>();
}
