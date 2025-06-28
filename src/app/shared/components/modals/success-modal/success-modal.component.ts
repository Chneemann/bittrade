import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PrimaryButtonComponent } from '../../buttons/primary-button/primary-button.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  CoinTransactionType,
  WalletTransactionType,
} from '../../../../home/models/wallet.model';

@Component({
  selector: 'app-success-modal',
  imports: [CommonModule, PrimaryButtonComponent],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.scss',
})
export class SuccessModalComponent {
  @Input() mode!:
    | CoinTransactionType.BUY
    | CoinTransactionType.SELL
    | WalletTransactionType.DEPOSIT
    | WalletTransactionType.WITHDRAW;
  @Input() transactionResult: any;
  @Input() coinSymbol?: string;
  @Input() show: boolean = false;

  @Output() close = new EventEmitter<void>();

  WalletTransactionType = WalletTransactionType;
  CoinTransactionType = CoinTransactionType;

  constructor(private router: Router) {}

  closeSuccess(): void {
    this.close.emit();
  }

  goToPortfolio(): void {
    this.close.emit();
    this.router.navigate(['/home/portfolio/']);
  }

  get isBuyOrSell(): boolean {
    return (
      this.mode === CoinTransactionType.BUY ||
      this.mode === CoinTransactionType.SELL
    );
  }

  get isDepositOrWithdraw(): boolean {
    return (
      this.mode === WalletTransactionType.DEPOSIT ||
      this.mode === WalletTransactionType.WITHDRAW
    );
  }
}
