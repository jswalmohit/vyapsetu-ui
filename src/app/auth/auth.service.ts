import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthToken {
  token: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'vyapsetu-ui-auth';
  private tokenSubject = new BehaviorSubject<AuthToken | null>(this.loadToken());

  readonly token$ = this.tokenSubject.asObservable();
  readonly isAuthenticated$ = this.token$.pipe(map((value) => !!value?.token));

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${environment.baseUrl}/api/Auth/login`, {
      username,
      password
    }).pipe(
      map((result) => {
        this.setToken(result);
        return result;
      })
    );
  }

  logout(): void {
    this.setToken(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value?.token ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setToken(token: AuthToken | null): void {
    if (token?.token) {
      sessionStorage.setItem(this.storageKey, JSON.stringify(token));
      this.tokenSubject.next(token);
    } else {
      sessionStorage.removeItem(this.storageKey);
      this.tokenSubject.next(null);
    }
  }

  private loadToken(): AuthToken | null {
    const stored = sessionStorage.getItem(this.storageKey);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthToken;
    } catch {
      return null;
    }
  }
}
