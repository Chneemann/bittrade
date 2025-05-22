import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';

  private loggedInSubject = new BehaviorSubject<boolean>(
    !!localStorage.getItem(this.TOKEN_KEY)
  );
  public isAuthenticated$ = this.loggedInSubject.asObservable();

  private authCheck$?: Observable<boolean>;

  constructor(private apiService: ApiService) {}

  initAuthCheck(): Observable<boolean> {
    if (this.authCheck$) {
      return this.authCheck$;
    }

    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      this.loggedInSubject.next(false);
      this.authCheck$ = of(false);
      return this.authCheck$;
    }

    this.authCheck$ = this.apiService.get('/auth/me/').pipe(
      tap(() => this.loggedInSubject.next(true)),
      map(() => true),
      catchError(() => {
        this.loggedInSubject.next(false);
        return of(false);
      }),
      shareReplay(1)
    );

    return this.authCheck$;
  }

  login(credentials: {
    email: string;
    password: string;
  }): Observable<{ token: string }> {
    this.authCheck$ = undefined;

    return this.apiService
      .post<{ token: string }>('/auth/login/', credentials)
      .pipe(
        tap((res) => {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.loggedInSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.loggedInSubject.next(false);
    this.authCheck$ = undefined;
  }
}
