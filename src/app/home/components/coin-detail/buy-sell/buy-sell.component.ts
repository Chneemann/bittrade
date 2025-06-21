import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';
import { OptionButtonComponent } from '../../../../shared/components/buttons/option-button/option-button.component';
import { WalletService } from '../../../services/wallet.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { CoinHolding } from '../../../models/coin.model';
import { CoinHoldingsService } from '../../../services/coin-holdings.service';
import { CoinTransactionService } from '../../../services/coin-transactions.service';

@Component({
  selector: 'app-buy-sell',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
    OptionButtonComponent,
  ],
  templateUrl: './buy-sell.component.html',
  styleUrl: './buy-sell.component.scss',
})
export class BuySellComponent {
  private readonly destroy$ = new Subject<void>();
  amountControl = new FormControl('');

  coinId = '';
  holding: CoinHolding | null = null;

  walletBalance = 0;
  cryptoBalance = 0;

  minValue = 10;
  maxValue = 10000;
  mode: 'buy' | 'sell' = 'buy';
  isUpdating = false;

  percentages = [
    { value: '10', label: '10%', mobileLabel: '10%' },
    { value: '25', label: '25%', mobileLabel: '25%' },
    { value: '50', label: '50%', mobileLabel: '50%' },
    { value: '75', label: '75%', mobileLabel: '75%' },
    { value: '100', label: '100%', mobileLabel: '100%' },
  ];
  selectedPercent = '0';

  constructor(
    private walletService: WalletService,
    private coinTransactionService: CoinTransactionService,
    private coinHoldingsService: CoinHoldingsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.updateMode();

    this.route.paramMap.subscribe((params) => {
      const coin = params.get('id');

      if (coin) {
        this.coinId = coin;
        this.loadHolding(coin);
      }
    });

    this.loadWalletBalance();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateMode(): void {
    this.mode = this.router.url.includes('sell') ? 'sell' : 'buy';
    this.resetAmountInput();
  }

  resetAmountInput(): void {
    const resetValue = this.mode === 'buy' ? '10' : '0.0001';
    this.amountControl.setValue(resetValue);
  }

  private loadWalletBalance(): void {
    this.walletService
      .getWallet()
      .pipe(takeUntil(this.destroy$))
      .subscribe((wallet) => {
        this.walletBalance = wallet.balance;
        this.updateMaxValue();
      });
  }

  loadHolding(coinId: string): void {
    this.coinHoldingsService.getHoldingByCoin(coinId).subscribe({
      next: (data) => {
        this.holding = data;
        this.cryptoBalance = data?.amount || 0;
        this.updateMaxValue();
      },
      error: (err) => {
        console.error('Error loading the holding:', err);
        this.holding = null;
        this.cryptoBalance = 0;
        this.updateMaxValue();
      },
    });
  }

  private updateMaxValue(): void {
    if (this.mode === 'buy') {
      this.minValue = 10;
      this.maxValue = Math.max(this.walletBalance, this.minValue);
    } else if (this.mode === 'sell') {
      this.minValue = 0.0001;
      this.maxValue = Math.max(this.cryptoBalance, this.minValue);
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
    return this.mode === 'buy'
      ? this.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : this.amount.toFixed(8).replace(/\.?0+$/, '');
  }

  get isInvalid(): boolean {
    return this.amount < this.minValue || this.amount > this.maxValue;
  }

  onInputChange(event: Event): void {
    let input = (event.target as HTMLInputElement).value;

    if (this.mode === 'buy') {
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

    if (this.mode === 'sell' && (event.key === '.' || event.key === ',')) {
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
    if (percent === 0) {
      this.amountControl.setValue(this.minValue.toString());
      return;
    }

    const base = this.mode === 'buy' ? this.walletBalance : this.cryptoBalance;
    let value = (base * percent) / 100;

    if (this.mode === 'buy') {
      value = Math.floor(value);
    } else {
      value = parseFloat(value.toFixed(8));
    }

    this.amountControl.setValue(value.toString());
  }

  submit(): void {
    if (this.isInvalid || this.isUpdating) return;

    const amount = Number(this.amountControl.value);
    if (!amount) return;

    this.processTransaction(amount);
  }

  private processTransaction(amount: number): void {
    this.isUpdating = true;
    const action = this.mode === 'buy' ? 'buyCoin' : 'sellCoin';

    this.coinTransactionService[action](this.coinId, amount)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isUpdating = false))
      )
      .subscribe({
        next: () => {
          this.resetAmountInput();
          this.selectedPercent = '0';
        },
        error: (error) => {
          console.error('Crypto transaction error:', error);
        },
      });
  }
}
