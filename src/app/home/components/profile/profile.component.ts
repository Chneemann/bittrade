import { Component, OnDestroy, OnInit } from '@angular/core';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { catchError, Observable, of, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink, PrimaryButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile$!: Observable<UserProfile>;
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.profile$ = this.userService.getProfile().pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        console.error('Profile could not be loaded', error);
        return of({
          id: '',
          username: '',
          email: '',
          coin_purchases: 0,
          coin_sales: 0,
          held_coins: 0,
          wallet_deposits: 0,
          wallet_withdrawals: 0,
          wallet_balance: 0,
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
