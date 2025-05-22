import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.loggedInSubject.asObservable();

  private authCheck$?: Observable<boolean>;

  constructor(private apiService: ApiService) {}

  initAuthCheck(): Observable<boolean> {
    if (this.authCheck$) {
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

  login(credentials: { email: string; password: string }): Observable<void> {
    this.authCheck$ = undefined;
    return this.apiService
      .post<void>('/auth/login/', credentials)
      .pipe(tap(() => this.loggedInSubject.next(true)));
  }

  logout(): Observable<void> {
    return this.apiService
      .post<void>('/auth/logout/', {})
      .pipe(tap(() => this.loggedInSubject.next(false)));
  }
}
