import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { UserService } from '../../home/services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.initAuthCheck().pipe(
      tap((isAuth) => {
        if (!isAuth) this.router.navigate(['/auth/login']);
      }),
      map((isAuth) => isAuth)
    );
  }
}
