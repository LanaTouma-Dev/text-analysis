import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    :host { display: block; }

    .login-shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 480px;
      background: var(--bg);
      position: relative;
      overflow: hidden;
    }

    /* ── Left panel ── */
    .visual {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background:
        radial-gradient(900px 700px at 40% 50%, rgba(108,99,255,.12), transparent 65%),
        radial-gradient(600px 600px at 80% 20%, rgba(58,134,255,.08), transparent 60%),
        var(--bg);
    }

    .radar-wrap {
      position: relative;
      width: 420px;
      height: 420px;
    }

    .radar-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 1px solid rgba(108,99,255,.18);
      animation: expand 3.6s ease-out infinite;
    }
    .radar-ring:nth-child(2) { animation-delay: 1.2s; }
    .radar-ring:nth-child(3) { animation-delay: 2.4s; }

    @keyframes expand {
      0%   { transform: scale(.2); opacity: .8; }
      100% { transform: scale(1);  opacity: 0; }
    }

    .radar-center {
      position: absolute;
      inset: 50%;
      transform: translate(-50%, -50%);
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(108,99,255,.25) 0%, rgba(108,99,255,.05) 60%, transparent 100%);
      border: 1px solid rgba(108,99,255,.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .radar-icon {
      width: 40px;
      height: 40px;
      color: #A8A2FF;
    }

    .radar-sweep {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      overflow: hidden;
    }
    .radar-sweep::after {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      width: 50%; height: 50%;
      background: conic-gradient(from 0deg, transparent 70%, rgba(108,99,255,.35) 100%);
      transform-origin: 0% 100%;
      animation: sweep 4s linear infinite;
    }
    @keyframes sweep { to { transform: rotate(360deg); } }

    .visual-tagline {
      position: absolute;
      bottom: 48px;
      left: 0; right: 0;
      text-align: center;
    }
    .visual-tagline h2 {
      margin: 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 400;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--text-3);
    }
    .visual-tagline p {
      margin: 8px 0 0;
      font-family: 'Cairo', sans-serif;
      font-size: 15px;
      color: rgba(108,99,255,.5);
      direction: rtl;
      letter-spacing: 2px;
    }

    /* Arabic watermark grid */
    .ar-watermark {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 28px;
      padding: 40px;
      pointer-events: none;
      opacity: .04;
      align-content: center;
    }
    .ar-watermark span {
      font-family: 'Cairo', sans-serif;
      font-size: 18px;
      color: var(--primary);
      text-align: center;
    }

    /* Scan line */
    .scanline {
      position: absolute;
      left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(108,99,255,.4), transparent);
      animation: scan 5s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes scan {
      0%   { top: 0%;   opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }

    /* ── Right panel — form ── */
    .form-panel {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 52px;
      background: var(--surface);
      border-left: 1px solid var(--border);
    }

    .sys-ident {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 52px;
    }
    .sys-logo {
      width: 38px; height: 38px;
      border-radius: 11px;
      background: var(--gradient);
      display: grid;
      place-items: center;
      box-shadow: 0 8px 24px -8px rgba(108,99,255,.7);
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }
    .sys-logo::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.35), transparent 55%);
    }
    .sys-logo svg { color: white; z-index: 1; }
    .sys-name { font-size: 15px; font-weight: 700; color: var(--text); }
    .sys-sub  { font-size: 10.5px; color: var(--text-3); letter-spacing: 1.8px; text-transform: uppercase; margin-top: 1px; }

    .form-header { margin-bottom: 36px; }
    .form-header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      color: var(--text);
      letter-spacing: -.3px;
      line-height: 1.15;
    }
    .form-header h1 span {
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .form-header p {
      margin: 8px 0 0;
      font-size: 13px;
      color: var(--text-2);
    }

    .field-group { display: flex; flex-direction: column; gap: 20px; }

    .field-wrap { display: flex; flex-direction: column; gap: 7px; }
    .field-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-3);
    }
    .field-input-wrap { position: relative; }
    .field-input-wrap .field-ico {
      position: absolute;
      left: 14px; top: 50%;
      transform: translateY(-50%);
      width: 16px; height: 16px;
      color: var(--text-3);
      pointer-events: none;
      transition: color .2s;
    }
    .field-input {
      width: 100%;
      background: rgba(15,12,41,.6);
      border: 1px solid var(--border);
      border-radius: 11px;
      padding: 13px 14px 13px 42px;
      color: var(--text);
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      box-sizing: border-box;
    }
    .field-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(108,99,255,.15);
    }
    .field-input:focus + .field-ico,
    .field-input-wrap:focus-within .field-ico { color: var(--primary); }
    .field-input::placeholder { color: var(--text-3); }

    .submit-btn {
      margin-top: 32px;
      width: 100%;
      padding: 14px;
      border: 0;
      border-radius: 11px;
      background: var(--gradient);
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      font-family: inherit;
      letter-spacing: .4px;
      cursor: pointer;
      box-shadow: 0 8px 24px -8px rgba(108,99,255,.7);
      transition: filter .2s, transform .12s, box-shadow .2s;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .submit-btn:hover:not(:disabled) {
      filter: brightness(1.1);
      box-shadow: 0 12px 32px -8px rgba(108,99,255,.85);
    }
    .submit-btn:active:not(:disabled) { transform: scale(.98); }
    .submit-btn:disabled {
      opacity: .7;
      cursor: not-allowed;
    }

    /* Spinner */
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Error */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 10px;
      background: rgba(255,77,109,.1);
      border: 1px solid rgba(255,77,109,.3);
      color: #FF4D6D;
      font-size: 13px;
      margin-top: 18px;
      animation: slideUp .25s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(6px); opacity: 0; }
      to   { transform: translateY(0);   opacity: 1; }
    }

    .form-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--safe);
      box-shadow: 0 0 8px rgba(6,214,160,.6);
    }
    .form-footer span {
      font-size: 11.5px;
      color: var(--text-3);
      font-family: 'JetBrains Mono', monospace;
    }

    @media (max-width: 900px) {
      .login-shell { grid-template-columns: 1fr; }
      .visual { display: none; }
      .form-panel { padding: 40px 28px; }
    }
  `],
  template: `
    <div class="login-shell">

      <!-- Left visual panel -->
      <div class="visual">
        <div class="ar-watermark">
          @for (w of arWords; track w) {
            <span>{{ w }}</span>
          }
        </div>
        <div class="scanline"></div>

        <div class="radar-wrap">
          <div class="radar-ring"></div>
          <div class="radar-ring"></div>
          <div class="radar-ring"></div>
          <div class="radar-sweep"></div>
          <div class="radar-center">
            <svg class="radar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
        </div>

        <div class="visual-tagline">
          <h2>Sentinel · SMS Intelligence</h2>
          <p>نظام الإشراف الذكي على الرسائل</p>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="form-panel">

        <div class="sys-ident">
          <div class="sys-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div class="sys-name">Sentinel</div>
            <div class="sys-sub">Syriatel · AI Moderation</div>
          </div>
        </div>

        <div class="form-header">
          <h1>Secure<br><span>Access Portal</span></h1>
          <p>Sign in with your moderator credentials</p>
        </div>

        <form (ngSubmit)="submit()" #f="ngForm" class="field-group">

          <div class="field-wrap">
            <label class="field-label" for="username">Username</label>
            <div class="field-input-wrap">
              <input
                id="username"
                class="field-input"
                type="text"
                placeholder="moderator@syriatel"
                [(ngModel)]="username"
                name="username"
                autocomplete="username"
                required
              />
              <svg class="field-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>

          <div class="field-wrap">
            <label class="field-label" for="password">Password</label>
            <div class="field-input-wrap">
              <input
                id="password"
                class="field-input"
                [type]="showPassword() ? 'text' : 'password'"
                placeholder="••••••••••"
                [(ngModel)]="password"
                name="password"
                autocomplete="current-password"
                required
              />
              <svg class="field-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>

          <button
            class="submit-btn"
            type="submit"
            [disabled]="loading() || !username || !password"
          >
            @if (loading()) {
              <div class="spinner"></div>
              <span>Authenticating…</span>
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Sign In
            }
          </button>

        </form>

        @if (error()) {
          <div class="error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error() }}
          </div>
        }

        <div class="form-footer">
          <div class="status-dot"></div>
          <span>SENTINEL-SYS · SECURE · v1.0</span>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading  = signal(false);
  error    = signal('');
  showPassword = signal(false);

  readonly arWords = [
    'رسالة', 'تحليل', 'محتوى', 'إشراف', 'ذكاء',
    'كشف',  'حماية', 'أمان',  'تصنيف', 'مراجعة',
    'بيانات','خدمة', 'شبكة', 'نظام',  'رقابة',
    'قرار',  'تقرير','تحقق', 'رصد',   'فلترة',
  ];

  submit(): void {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/overview']),
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid credentials. Please check your username and password.');
      }
    });
  }
}
