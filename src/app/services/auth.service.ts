import { Injectable } from '@angular/core';
import { BackendApiService } from './backend/backend-api.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { CoinGeckoCacheService } from './external/coin-gecko-cache.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.loggedInSubject.asObservable();

  private authCheck$: Observable<boolean> | null = null;

  constructor(
    private backendApiService: BackendApiService,
    private coinGeckoCacheService: CoinGeckoCacheService
  ) {}

  initAuthCheck(): Observable<boolean> {
    if (this.authCheck$) {
      return this.authCheck$;
    }

    this.authCheck$ = this.backendApiService.get('/auth/me/').pipe(
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

  login(credentials: { email: string; password: string }): Observable<void> {
    return this.backendApiService
      .post<void, { email: string; password: string }>(
        '/auth/login/',
        credentials
      )
      .pipe(
        tap(() => {
          this.loggedInSubject.next(true);
          this.authCheck$ = null;
        })
      );
  }

  logout(): Observable<void> {
    return this.backendApiService
      .post<void, {}>('/auth/logout/', {})
      .pipe(tap(() => this.clearSession()));
  }

  private clearSession(): void {
    this.loggedInSubject.next(false);
    this.coinGeckoCacheService.clearAllCoinDataCache();
  }
}
