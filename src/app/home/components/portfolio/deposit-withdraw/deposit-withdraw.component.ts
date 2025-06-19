import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';
import { OptionButtonComponent } from '../../../../shared/components/buttons/option-button/option-button.component';
import { WalletService } from '../../../services/wallet.service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-deposit-withdraw',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
    OptionButtonComponent,
  ],
  templateUrl: './deposit-withdraw.component.html',
  styleUrl: './deposit-withdraw.component.scss',
})
export class DepositWithdrawComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();
  amountControl = new FormControl('10');

  walletBalance = 0;
  minValue = 10;
  maxValue = 10000;
  mode: 'deposit' | 'withdraw' = 'deposit';
  isUpdating = false;

  percentages = [
    { value: '10', label: '10%', mobileLabel: '10%' },
    { value: '25', label: '25%', mobileLabel: '25%' },
    { value: '50', label: '50%', mobileLabel: '50%' },
    { value: '75', label: '75%', mobileLabel: '75%' },
    { value: '100', label: '100%', mobileLabel: '100%' },
  ];
  selectedPercent = '0';

  constructor(private router: Router, private walletService: WalletService) {}

  ngOnInit(): void {
    this.updateMode();
    this.loadWalletBalance();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWalletBalance(): void {
    this.walletService
      .getWallet()
      .pipe(takeUntil(this.destroy$))
      .subscribe((wallet) => {
        this.walletBalance = wallet.balance;
      });
  }

  get rawAmount(): string {
    return this.amountControl.value ?? '0';
  }

  get amount(): number {
    return parseFloat(this.rawAmount.replace(/,/g, '')) || 0;
  }

  get displayValue(): string {
    return this.amount.toLocaleString('en-US');
  }

  get isInvalid(): boolean {
    return this.amount < this.minValue || this.amount > this.maxValue;
  }

  get formattedAmount(): string {
    return this.amount.toLocaleString('en-US');
  }

  updateMode() {
    this.mode = this.router.url.includes('withdraw') ? 'withdraw' : 'deposit';
  }

  onInputChange(event: Event) {
    const input = (event.target as HTMLInputElement).value.replace(
      /[^0-9]/g,
      ''
    );
    this.amountControl.setValue(input);
  }

  onBlur() {
    if (this.amount < this.minValue) {
      this.amountControl.setValue(this.minValue.toString());
    } else if (this.amount > this.maxValue) {
      this.amountControl.setValue(this.maxValue.toString());
    } else if (this.amount > this.walletBalance) {
      this.amountControl.setValue(this.walletBalance.toString());
    }
  }

  blockNonNumeric(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];
    if (
      allowedKeys.includes(event.key) ||
      (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))
    ) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onPercentageChange(value: string) {
    this.selectedPercent = value;
    this.applyPercentage(+value);
  }

  applyPercentage(percent: number) {
    if (percent === 0) {
      this.amountControl.setValue(this.minValue.toString());
      return;
    }

    const base = this.mode === 'deposit' ? this.maxValue : this.walletBalance;
    const value = Math.floor((base * percent) / 100);
    this.amountControl.setValue(value.toString());
  }

  submit() {
    if (this.isInvalid || this.isUpdating) return;

    const amount = Number(this.amountControl.value);
    if (amount === null) return;

    this.updateWalletBalance(amount);
  }

  private updateWalletBalance(amount: number) {
    this.isUpdating = true;

    this.walletService
      .changeWalletBalance(amount, this.mode)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isUpdating = false))
      )
      .subscribe({
        next: (wallet) => {
          this.walletBalance = wallet.balance;
          this.amountControl.setValue('10');
          this.selectedPercent = '0';
        },
        error: (error) => {
          console.error('Error during wallet update:', error);
        },
      });
  }
}
