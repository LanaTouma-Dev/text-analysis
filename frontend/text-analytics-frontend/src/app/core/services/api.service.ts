import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { QueueMessage, MessageStatus } from '../models/sentinel.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  // Queue
  getQueue(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<{ results: QueueMessage[]; count: number }>(
      `${this.base}/decisions/`, { params }
    );
  }

  decide(id: string, action: MessageStatus) {
    return this.http.post(`${this.base}/decisions/${id}/decide/`, { action });
  }

  // Analytics
  getSummary() {
    return this.http.get<any>(`${this.base}/analytics/summary/`);
  }

  getVolume(range: string) {
    return this.http.get<any[]>(`${this.base}/analytics/volume/`, {
      params: new HttpParams().set('range', range)
    });
  }

  getCategories() {
    return this.http.get<any[]>(`${this.base}/analytics/categories/`);
  }

  // Audit
  getAuditLog() {
    return this.http.get<any>(`${this.base}/audit/`);
  }

  // Thresholds
  getThresholds() {
    return this.http.get<any[]>(`${this.base}/thresholds/`);
  }

  updateThresholds(data: any[]) {
    return this.http.put(`${this.base}/thresholds/`, data);
  }

  // Health
  getHealth() {
    return this.http.get<any>(`${this.base}/health/`);
  }
}
