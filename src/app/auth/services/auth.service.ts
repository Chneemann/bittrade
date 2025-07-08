import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { BackendApiService } from '../../core/services/backend-api.service';
import { CoinGeckoCacheService } from '../../core/services/external/coin-gecko-cache.service';
import { UserService } from '../../home/services/user.service';
import { UserProfile } from '../../home/models/user.model';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.loggedInSubject.asObservable();

  private authCheck$: Observable<boolean> | null = null;

  constructor(
    private backendApiService: BackendApiService,
    private coinGeckoCacheService: CoinGeckoCacheService,
    private userService: UserService
  ) {}

  initAuthCheck(): Observable<boolean> {
    if (this.authCheck$) return this.authCheck$;

    this.authCheck$ = this.backendApiService.get<UserProfile>('/auth/me/').pipe(
      tap((profile) => {
        this.loggedInSubject.next(true);
        this.userService.setProfile(profile);
      }),
      map(() => true),
      catchError(() => {
        this.loggedInSubject.next(false);
        this.userService.clearProfile();
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

  verifyEmail(uid: string, token: string): Observable<{ detail: string }> {
    return this.backendApiService.get<{ detail: string }>(
      '/auth/verify-email/',
      new HttpParams({ fromObject: { uid, token } })
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
