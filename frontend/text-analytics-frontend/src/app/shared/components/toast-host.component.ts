import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="toast-wrap">
      @for (t of toastSvc.toasts(); track t.id) {
        <div [class]="'toast ' + t.kind">
          <div class="ico">
            @if (t.kind === 'approve') {
              <svg class="ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>
            } @else if (t.kind === 'block') {
              <svg class="ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>
            } @else {
              <svg class="ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V4l8-1 8 2v9l-8-2-8 1z"/></svg>
            }
          </div>
          <div>
            <div class="ttl">{{ t.title }}</div>
            <div class="msg">{{ t.msg }}</div>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastHostComponent {
  toastSvc = inject(ToastService);
}
