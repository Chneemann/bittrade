import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../home/services/user.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.handleLogout();
  }

  private async handleLogout(): Promise<void> {
    try {
      await firstValueFrom(this.authService.logout());
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      this.userService.clearProfile();
      this.redirectToLogin();
    }
  }

  private redirectToLogin(): void {
    this.router.navigate(['/auth/login']).catch((err) => {
      console.error('Navigation error', err);
    });
  }
}
