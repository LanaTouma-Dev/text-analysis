import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CATEGORIES } from '../../core/data/sentinel.data';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-root">

      <div class="page-header">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-sub">System configuration · Sentinel v3.4</p>
        </div>
        <button class="save-btn" (click)="save()" [disabled]="saving()">
          @if (saving()) {
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .6s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            Saving…
          } @else if (saved()) {
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 6"/></svg>
            Saved
          } @else {
            Save Changes
          }
        </button>
      </div>

      <div class="settings-grid">

        <!-- AI Model -->
        <div class="card settings-section">
          <div class="section-title">AI Model Configuration</div>
          <div class="field-group">
            <div class="field">
              <label>Inference Model</label>
              <div class="select-wrap">
                <select [(ngModel)]="model">
                  <option value="marbert">MARBERT (Arabic · 163M params)</option>
                  <option value="camelbert">CAMeLBERT-Mix</option>
                  <option value="arabert">AraBERT v2</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Explanation Model</label>
              <div class="select-wrap">
                <select [(ngModel)]="explModel">
                  <option value="acegpt">AceGPT-7B (Local)</option>
                  <option value="llama">Llama-3.2-3B (Local)</option>
                  <option value="none">Disabled</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Global Confidence Threshold</label>
              <div class="slider-row">
                <input type="range" min="50" max="95" [(ngModel)]="threshold" class="slider" />
                <span class="slider-val mono">{{ threshold }}%</span>
              </div>
              <div class="field-hint">Minimum confidence to flag a message for human review</div>
            </div>
          </div>
        </div>

        <!-- Per-category thresholds -->
        <div class="card settings-section">
          <div class="section-title">Per-Category Thresholds</div>
          <div class="cat-thresholds">
            @for (cat of categories; track cat.id) {
              <div class="ct-row">
                <div class="ct-dot" [style.background]="cat.color"></div>
                <div class="ct-name">{{ cat.name }}</div>
                <input type="range" min="50" max="99" [ngModel]="catThresholds[cat.id]"
                       (ngModelChange)="catThresholds[cat.id] = $event" class="ct-slider" />
                <span class="ct-val mono">{{ catThresholds[cat.id] }}%</span>
              </div>
            }
          </div>
        </div>

        <!-- Queue settings -->
        <div class="card settings-section">
          <div class="section-title">Queue & Review</div>
          <div class="field-group">
            <div class="field">
              <label>Auto-approve low-risk after</label>
              <div class="select-wrap">
                <select [(ngModel)]="autoApprove">
                  <option value="never">Never (always require human)</option>
                  <option value="4h">4 hours</option>
                  <option value="8h">8 hours</option>
                  <option value="24h">24 hours</option>
                </select>
              </div>
            </div>
            <div class="field toggle-field">
              <div>
                <label>AceGPT Explanations</label>
                <div class="field-hint">Generate Arabic/English explanation for every flagged message</div>
              </div>
              <div class="toggle" [class.on]="aceGpt" (click)="aceGpt = !aceGpt">
                <div class="toggle-thumb"></div>
              </div>
            </div>
            <div class="field toggle-field">
              <div>
                <label>Real-time Feed</label>
                <div class="field-hint">Stream all messages to the live feed view</div>
              </div>
              <div class="toggle" [class.on]="liveFeed" (click)="liveFeed = !liveFeed">
                <div class="toggle-thumb"></div>
              </div>
            </div>
            <div class="field toggle-field">
              <div>
                <label>Audit Logging</label>
                <div class="field-hint">Record all moderator actions to immutable log</div>
              </div>
              <div class="toggle on" style="pointer-events:none;opacity:.7">
                <div class="toggle-thumb"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- System status -->
        <div class="card settings-section">
          <div class="section-title">System Status</div>
          <div class="sys-rows">
            <div class="sys-row">
              <span class="sys-dot ok"></span>
              <div class="sys-info">
                <div class="sys-name">MARBERT Inference (GPU A)</div>
                <div class="sys-detail">Throughput: ~3,200 msg/s · 12ms avg</div>
              </div>
              <span class="sys-badge ok">HEALTHY</span>
            </div>
            <div class="sys-row">
              <span class="sys-dot ok"></span>
              <div class="sys-info">
                <div class="sys-name">AceGPT-7B Inference</div>
                <div class="sys-detail">Model loaded · VRAM 12.4 GB / 24 GB</div>
              </div>
              <span class="sys-badge ok">HEALTHY</span>
            </div>
            <div class="sys-row">
              <span class="sys-dot ok"></span>
              <div class="sys-info">
                <div class="sys-name">RabbitMQ Stream</div>
                <div class="sys-detail">Queue depth: 142 · 99.99% uptime</div>
              </div>
              <span class="sys-badge ok">HEALTHY</span>
            </div>
            <div class="sys-row">
              <span class="sys-dot warn"></span>
              <div class="sys-info">
                <div class="sys-name">GPU Cluster B (Standby)</div>
                <div class="sys-detail">Load: 87% · Temperature: 76°C</div>
              </div>
              <span class="sys-badge warn">WARN</span>
            </div>
            <div class="sys-row">
              <span class="sys-dot ok"></span>
              <div class="sys-info">
                <div class="sys-name">Redis Cache</div>
                <div class="sys-detail">Memory: 2.1 GB / 8 GB · Hit rate 94%</div>
              </div>
              <span class="sys-badge ok">HEALTHY</span>
            </div>
          </div>
          <div class="version-row">
            <span>Sentinel v3.4.1</span>
            <span>·</span>
            <span>Django 5.1</span>
            <span>·</span>
            <span>Angular 21</span>
            <span>·</span>
            <span>MARBERT 1.0</span>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-root { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .page-title { font-size: 22px; font-weight: 700; color: var(--text); margin: 0; }
    .page-sub { font-size: 13px; color: var(--muted); margin: 4px 0 0; }

    .save-btn { display: flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: 10px;
                background: var(--primary); color: #fff; border: none; font-size: 13px; font-weight: 600;
                cursor: pointer; transition: all .15s; }
    .save-btn:hover { background: var(--primary-2); }

    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .settings-section { padding: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 18px;
                     padding-bottom: 12px; border-bottom: 1px solid rgba(108,99,255,.1); }

    .field-group { display: flex; flex-direction: column; gap: 18px; }
    .field { display: flex; flex-direction: column; gap: 8px; }
    .field label { font-size: 12px; font-weight: 600; color: var(--text); }
    .field-hint { font-size: 11px; color: var(--muted); margin-top: 2px; }

    .select-wrap select { width: 100%; background: rgba(108,99,255,.08); border: 1px solid rgba(108,99,255,.2);
                           color: var(--text); padding: 9px 12px; border-radius: 8px; font-size: 13px;
                           outline: none; cursor: pointer; }
    .select-wrap select:focus { border-color: rgba(108,99,255,.5); }

    .slider-row { display: flex; align-items: center; gap: 12px; }
    .slider { flex: 1; accent-color: var(--primary); cursor: pointer; }
    .slider-val { font-size: 14px; font-weight: 700; color: var(--primary); min-width: 40px; }

    .toggle-field { flex-direction: row; align-items: center; justify-content: space-between; }
    .toggle { width: 40px; height: 22px; border-radius: 11px; background: rgba(108,99,255,.2);
              position: relative; cursor: pointer; transition: background .2s; flex-shrink: 0; }
    .toggle.on { background: var(--primary); }
    .toggle-thumb { width: 16px; height: 16px; border-radius: 50%; background: #fff;
                    position: absolute; top: 3px; left: 3px; transition: left .2s; }
    .toggle.on .toggle-thumb { left: 21px; }

    .cat-thresholds { display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto; }
    .ct-row { display: flex; align-items: center; gap: 10px; }
    .ct-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .ct-name { font-size: 12px; color: var(--muted); width: 150px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ct-slider { flex: 1; accent-color: var(--primary); }
    .ct-val { font-size: 12px; color: var(--text); width: 36px; text-align: right; }

    .sys-rows { display: flex; flex-direction: column; gap: 12px; }
    .sys-row { display: flex; align-items: center; gap: 12px; }
    .sys-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .sys-dot.ok { background: var(--safe); box-shadow: 0 0 0 3px rgba(6,214,160,.2); }
    .sys-dot.warn { background: var(--warn); box-shadow: 0 0 0 3px rgba(255,183,3,.2); }
    .sys-info { flex: 1; }
    .sys-name { font-size: 13px; font-weight: 600; color: var(--text); }
    .sys-detail { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .sys-badge { font-size: 9px; font-weight: 700; letter-spacing: .06em; padding: 3px 8px; border-radius: 5px; }
    .sys-badge.ok { background: rgba(6,214,160,.12); color: var(--safe); }
    .sys-badge.warn { background: rgba(255,183,3,.12); color: var(--warn); }

    .version-row { display: flex; gap: 8px; align-items: center; margin-top: 20px; padding-top: 14px;
                   border-top: 1px solid rgba(108,99,255,.1); font-size: 11px; color: var(--muted);
                   flex-wrap: wrap; }

    @media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);

  categories = CATEGORIES;
  saved  = signal(false);
  saving = signal(false);

  model = 'marbert';
  explModel = 'acegpt';
  threshold = 70;
  autoApprove = 'never';
  aceGpt = true;
  liveFeed = true;

  catThresholds: Record<string, number> = Object.fromEntries(
    CATEGORIES.map(c => [c.id, 70])
  );

  ngOnInit() {
    this.api.getThresholds().subscribe({
      next: data => {
        data.forEach((t: any) => {
          // API returns 0.0–1.0, UI uses 0–100 integers
          this.catThresholds[t.category_id] = Math.round(t.threshold * 100);
        });
      },
      error: err => console.error('Failed to load thresholds', err),
    });
  }

  save() {
    this.saving.set(true);
    this.saved.set(false);

    const payload = Object.entries(this.catThresholds).map(([category_id, pct]) => ({
      category_id,
      threshold: pct / 100,
    }));

    this.api.updateThresholds(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: err => {
        this.saving.set(false);
        console.error('Failed to save thresholds', err);
      },
    });
  }
}
