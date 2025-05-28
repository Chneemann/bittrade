import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.initAuthCheck().pipe(
      tap((isAuth) => {
        if (!isAuth) this.router.navigate(['/auth/login']);
      }),
      map((isAuth) => isAuth)
    );
  }
}
