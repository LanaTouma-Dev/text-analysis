import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(localStorage.getItem('access_token'));

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<{ access: string; refresh: string }>(
      `${environment.authBase}/token/`,
      { username, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('access_token',  res.access);
        localStorage.setItem('refresh_token', res.refresh);
        this.token.set(res.access);
      })
    );
  }

  refresh() {
    const refresh = localStorage.getItem('refresh_token');
    return this.http.post<{ access: string }>(
      `${environment.authBase}/token/refresh/`,
      { refresh }
    ).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access);
        this.token.set(res.access);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.token.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }
}
