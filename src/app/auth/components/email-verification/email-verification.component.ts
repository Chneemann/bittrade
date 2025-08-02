import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-email-verification',
  imports: [CommonModule],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss',
})
export class EmailVerificationComponent implements OnInit {
  message = '';
  loading = true;
  redirectDelay = 5000;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const uid = this.route.snapshot.queryParamMap.get('uid');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!uid || !token) {
      this.handleError('Missing verification information.');
      return;
    }

    this.authService
      .verifyEmail(uid, token)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdRef.detectChanges();
        })
      )
      .subscribe({
        next: (res) => this.handleSuccess(res.detail),
        error: (err) =>
          this.handleError(err.error?.detail || 'Verification failed.'),
      });
  }

  private handleSuccess(msg?: string): void {
    this.message = msg || 'Email successfully verified.';
    this.scheduleRedirect();
  }

  private handleError(msg: string): void {
    this.message = msg;
    this.scheduleRedirect();
  }

  private scheduleRedirect(): void {
    setTimeout(() => this.redirectToLogin(), this.redirectDelay);
  }

  redirectToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
