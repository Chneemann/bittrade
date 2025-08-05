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
import { ActivatedRoute, Router } from '@angular/router';
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';
import { OptionButtonComponent } from '../../../../shared/components/buttons/option-button/option-button.component';
import { WalletService } from '../../../services/wallet.service';
import {
  catchError,
  EMPTY,
  forkJoin,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import {
  Coin,
  CoinHolding,
  CoinTransactionCreateDto,
} from '../../../models/coin.model';
import { CoinHoldingsService } from '../../../services/coin-holdings.service';
import { CoinTransactionService } from '../../../services/coin-transactions.service';
import { CoinGeckoService } from '../../../../core/services/external/coin-gecko.service';
import {
  CoinTransactionType,
  WalletTransactionSource,
  WalletTransactionType,
} from '../../../models/wallet.model';
import { SuccessModalComponent } from '../../../../shared/components/modals/success-modal/success-modal.component';
import { ConfirmationModalComponent } from '../../../../shared/components/modals/confirmation-modal/confirmation-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserProfile } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-buy-sell',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
    OptionButtonComponent,
    SuccessModalComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './buy-sell.component.html',
  styleUrl: './buy-sell.component.scss',
})
export class BuySellComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  amountControl: FormControl = new FormControl();

  currentCoin: Coin | null = null;
  holding: CoinHolding | null = null;

  previewTransaction: CoinTransactionCreateDto | null = null;
  transactionResult: CoinTransactionCreateDto | null = null;
  CoinTransactionType = CoinTransactionType;
  mode: CoinTransactionType = CoinTransactionType.BUY;

  walletBalance = 0;
  cryptoBalance = 0;

  minValue = 10;
  maxValue = 10000;

  isUpdating = false;
  showSuccessModal = false;
  showConfirmationModal = false;

  percentages = [
    { value: '10', label: '10%', mobileLabel: '10%' },
    { value: '25', label: '25%', mobileLabel: '25%' },
    { value: '50', label: '50%', mobileLabel: '50%' },
    { value: '75', label: '75%', mobileLabel: '75%' },
    { value: '100', label: '100%', mobileLabel: '100%' },
  ];
  selectedPercent = '0';

  currentCoin$!: Observable<Coin>;
  userProfile$!: Observable<UserProfile | null>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private walletService: WalletService,
    private userService: UserService,
    private coinTransactionService: CoinTransactionService,
    private coinHoldingsService: CoinHoldingsService,
    private coinGeckoService: CoinGeckoService
  ) {}

  ngOnInit(): void {
    this.amountControl = this.fb.control('', this.getAmountValidators());
    this.updateMode();
    this.loadCurrentCoin();
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

  updateMode(): void {
    this.mode = this.router.url.includes(CoinTransactionType.SELL)
      ? CoinTransactionType.SELL
      : CoinTransactionType.BUY;
    this.resetAmountInput();
  }

  resetAmountInput(): void {
    const resetValue = this.mode === CoinTransactionType.BUY ? '10' : '0.0001';
    this.amountControl.setValue(resetValue);
  }

  loadCurrentCoin() {
    return (this.currentCoin$ = this.route.paramMap.pipe(
      map((params) => params.get('id')?.toLowerCase() ?? ''),
      switchMap((coinId) => {
        if (!coinId) {
          return throwError(() => new Error('Coin ID missing'));
        }
        return forkJoin({
          coin: this.coinGeckoService.getCoinData(coinId),
          holding: this.coinHoldingsService.getHoldingByCoin(coinId),
        });
      }),
      tap(({ holding, coin }) => {
        this.holding = holding;
        this.cryptoBalance = holding.amount;
        this.currentCoin = coin.data;
        this.updateMinMaxValue(coin.data);
      }),
      map(({ coin }) => coin.data),
      catchError((err) => {
        console.error('Error loading coin or holding', err);
        this.holding = null;
        this.cryptoBalance = 0;
        return EMPTY;
      })
    ));
  }

  private loadWalletBalance(): void {
    this.walletService
      .getWallet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((wallet) => {
        this.walletBalance = wallet.balance;
      });
  }

  loadHolding(coinId: string): void {
    this.coinHoldingsService.getHoldingByCoin(coinId).subscribe({
      next: (data) => {
        this.holding = data;
        this.cryptoBalance = data?.amount || 0;
      },
      error: (err) => {
        console.error('Error loading the holding:', err);
        this.holding = null;
        this.cryptoBalance = 0;
      },
    });
  }

  private calculateMinMaxValues(price: number): { min: number; max: number } {
    if (this.mode === CoinTransactionType.BUY) {
      return { min: 10, max: 10000 };
    }

    if (price < 100) return { min: 0.1, max: 10000 };
    if (price < 1000) return { min: 0.01, max: 1000 };
    if (price < 10000) return { min: 0.001, max: 100 };
    return { min: 0.0001, max: 10 };
  }

  private updateMinMaxValue(coin: Coin): void {
    const price = coin.market_data?.current_price?.['usd'] ?? 0;
    const { min, max } = this.calculateMinMaxValues(price);
    this.minValue = min;
    this.maxValue = max;

    this.amountControl.setValidators(this.getAmountValidators());
    this.amountControl.updateValueAndValidity();

    if (this.amount < this.minValue) {
      this.amountControl.setValue(this.minValue.toString());
    }
  }

  get rawAmount(): string {
    return this.amountControl.value ?? '0';
  }

  get amount(): number {
    return parseFloat(this.rawAmount.replace(/,/g, '.').replace(/ /g, '')) || 0;
  }

  get displayValue(): string {
    if (this.amount === 0) return '0';
    return this.mode === CoinTransactionType.BUY
      ? this.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : this.amount.toFixed(8).replace(/\.?0+$/, '');
  }

  get isInvalid(): boolean {
    return (
      !this.amount ||
      isNaN(this.amount) ||
      this.amount < this.minValue ||
      this.amount > this.maxValue ||
      (this.mode === CoinTransactionType.SELL &&
        this.amount > this.cryptoBalance) ||
      (this.mode === CoinTransactionType.BUY &&
        this.amount > this.walletBalance)
    );
  }

  onInputChange(event: Event): void {
    let input = (event.target as HTMLInputElement).value;

    if (this.mode === CoinTransactionType.BUY) {
      input = input.replace(/[^0-9]/g, '');
    } else {
      input = input.replace(/[^0-9.,]/g, '').replace(/[,]/g, '.');

      const parts = input.split('.');
      if (parts.length > 2) {
        input = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    this.amountControl.setValue(input);
  }

  onBlur(): void {
    if (this.amount < this.minValue) {
      this.amountControl.setValue(this.minValue.toString());
    } else if (this.amount > this.maxValue) {
      this.amountControl.setValue(this.maxValue.toString());
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

    if (
      this.mode === CoinTransactionType.SELL &&
      (event.key === '.' || event.key === ',')
    ) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onPercentageChange(value: string): void {
    this.selectedPercent = value;
    this.applyPercentage(+value);
  }

  applyPercentage(percent: number): void {
    const base =
      this.mode === CoinTransactionType.BUY
        ? this.walletBalance
        : this.cryptoBalance;
    const value = (base * percent) / 100;

    const rounded =
      this.mode === CoinTransactionType.BUY
        ? Math.floor(value)
        : parseFloat(value.toFixed(8));

    this.amountControl.setValue(rounded.toString());
  }

  submit(): void {
    if (this.isInvalid || this.isUpdating) return;

    const priceUSD = this.currentCoin?.market_data?.current_price?.['usd'] ?? 0;

    const transaction: CoinTransactionCreateDto = {
      transaction_type: this.mode,
      amount:
        this.mode === CoinTransactionType.BUY
          ? parseFloat((this.amount / priceUSD).toFixed(8))
          : parseFloat(this.amount.toFixed(8)),
      price_per_coin: priceUSD,
    };

    this.previewTransaction = transaction;
    this.showConfirmationModal = true;
  }

  onUserConfirmed() {
    console.log(!this.currentCoin);
    if (!this.currentCoin) return;

    this.showConfirmationModal = false;
    this.isUpdating = true;

    const priceUSD = this.currentCoin.market_data.current_price['usd'];
    const transactionHandler =
      this.mode === CoinTransactionType.BUY
        ? this.handleBuyTransaction.bind(this)
        : this.handleSellTransaction.bind(this);

    transactionHandler(this.amount, priceUSD);
  }

  private handleBuyTransaction(amount: number, priceUSD: number) {
    const amountInCoins = parseFloat((amount / priceUSD).toFixed(8));
    const transaction: CoinTransactionCreateDto = {
      transaction_type: CoinTransactionType.BUY,
      amount: amountInCoins,
      price_per_coin: priceUSD,
    };

    this.processTransaction(transaction, () => {
      this.updateWalletBalance(amount, WalletTransactionType.WITHDRAW, () => {
        this.showSuccessModal = true;
        this.isUpdating = false;
      });
    });
  }

  private handleSellTransaction(amount: number, priceUSD: number) {
    const amountInFiat = parseFloat((amount * priceUSD).toFixed(2));
    const transaction: CoinTransactionCreateDto = {
      transaction_type: CoinTransactionType.SELL,
      amount: amount,
      price_per_coin: priceUSD,
    };

    this.updateWalletBalance(
      amountInFiat,
      WalletTransactionType.DEPOSIT,
      () => {
        this.processTransaction(transaction, () => {
          this.showSuccessModal = true;
          this.isUpdating = false;
        });
      }
    );
  }

  private processTransaction(
    transaction: CoinTransactionCreateDto,
    onSuccess?: () => void
  ): void {
    if (!this.currentCoin) return;
    const coinSlug = this.currentCoin.web_slug;

    this.coinTransactionService
      .addTransaction(coinSlug, transaction)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loadHolding(coinSlug);
          this.transactionResult = result;
          this.resetAmountInput();
          this.selectedPercent = '0';
          if (onSuccess) onSuccess();
        },
        error: (error) => {
          console.error('Crypto transaction error:', error);
        },
      });
  }

  private updateWalletBalance(
    amount: number,
    mode: WalletTransactionType.DEPOSIT | WalletTransactionType.WITHDRAW,
    onSuccess?: () => void
  ): void {
    this.walletService
      .changeWalletBalance(amount, mode, WalletTransactionSource.COIN)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (wallet) => {
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
