import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';
import { OptionButtonComponent } from '../../../../shared/components/buttons/option-button/option-button.component';
import { WalletService } from '../../../services/wallet.service';
import {
  WalletTransactionSource,
  WalletTransactionType,
} from '../../../models/wallet.model';
import { Observable } from 'rxjs';
import { SuccessModalComponent } from '../../../../shared/components/modals/success-modal/success-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserProfile } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-deposit-withdraw',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    PrimaryButtonComponent,
    OptionButtonComponent,
    SuccessModalComponent,
  ],
  templateUrl: './deposit-withdraw.component.html',
  styleUrl: './deposit-withdraw.component.scss',
})
export class DepositWithdrawComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  amountControl: FormControl = new FormControl();

  WalletTransactionType = WalletTransactionType;
  mode: WalletTransactionType = WalletTransactionType.WITHDRAW;
  transactionResult: number | null = null;

  walletBalance = 0;
  minValue = 10;
  maxValue = 10000;
  isUpdating = false;
  showSuccessModal = false;

  percentages = [
    { value: '10', label: '10%', mobileLabel: '10%' },
    { value: '25', label: '25%', mobileLabel: '25%' },
    { value: '50', label: '50%', mobileLabel: '50%' },
    { value: '75', label: '75%', mobileLabel: '75%' },
    { value: '100', label: '100%', mobileLabel: '100%' },
  ];
  selectedPercent = '0';

  userProfile$!: Observable<UserProfile | null>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private walletService: WalletService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.amountControl = this.fb.control('', this.getAmountValidators());
    this.updateMode();
    this.loadWalletBalance();
    this.userProfile$ = this.userService.userProfile$;
  }

  private getAmountValidators(): ValidatorFn[] {
    return [
      Validators.required,
      Validators.min(this.minValue),
      Validators.max(this.maxValue),
    ];
  }

  private loadWalletBalance(): void {
    this.walletService
      .getWallet()
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  updateMode() {
    this.mode = this.router.url.includes(WalletTransactionType.WITHDRAW)
      ? WalletTransactionType.WITHDRAW
      : WalletTransactionType.DEPOSIT;

    this.amountControl.setValidators(this.getAmountValidators());
    this.amountControl.updateValueAndValidity();

    if (this.amount < this.minValue) {
      this.amountControl.setValue(this.minValue.toString());
    }
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

  blockNonNumeric(event: KeyboardEvent): void {
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

    const base =
      this.mode === WalletTransactionType.DEPOSIT
        ? this.maxValue
        : this.walletBalance;
    const value = Math.floor((base * percent) / 100);
    this.amountControl.setValue(value.toString());
  }

  submit() {
    if (this.isInvalid || this.isUpdating) return;

    const amount = Number(this.amountControl.value);
    if (amount === null) return;

    this.updateWalletBalance(amount, this.mode, () => {
      this.showSuccessModal = true;
      this.isUpdating = false;
    });
  }

  private updateWalletBalance(
    amount: number,
    mode: WalletTransactionType.DEPOSIT | WalletTransactionType.WITHDRAW,
    onSuccess?: () => void
  ): void {
    this.walletService
      .changeWalletBalance(amount, mode, WalletTransactionSource.FIAT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (wallet: any) => {
          this.transactionResult = wallet.amount;
          this.walletBalance = wallet.balance;
          this.amountControl.setValue('10');
          this.selectedPercent = '0';
          if (onSuccess) onSuccess();
        },
        error: (error) => {
          console.error('Error during wallet update:', error);
        },
      });
  }
}
