import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { finalize } from 'rxjs';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-email-verification',
  imports: [CommonModule, RouterLink, PrimaryButtonComponent],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss',
})
export class EmailVerificationComponent implements OnInit {
  message = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.verifyEmailFromParams();
  }

  private verifyEmailFromParams(): void {
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

  private handleSuccess(msg: string): void {
    this.message = msg;
  }

  private handleError(msg: string): void {
    this.message = msg;
  }
}
