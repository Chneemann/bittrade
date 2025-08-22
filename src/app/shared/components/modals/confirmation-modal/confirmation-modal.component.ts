import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CoinTransactionType,
  WalletTransactionType,
} from '../../../../home/models/wallet.model';
import { PrimaryButtonComponent } from '../../buttons/primary-button/primary-button.component';
import { CoinTransactionCreateDto } from '../../../../home/models/coin.model';

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule, PrimaryButtonComponent],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
})
export class ConfirmationModalComponent {
  @Input() mode!:
    | CoinTransactionType.BUY
    | CoinTransactionType.SELL
    | WalletTransactionType.DEPOSIT
    | WalletTransactionType.WITHDRAW;
  @Input() previewTransaction!: CoinTransactionCreateDto | number | null;
  @Input() coinSymbol?: string;
  @Input() show: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  CoinTransactionType = CoinTransactionType;
  WalletTransactionType = WalletTransactionType;

  isCoinTransaction(
    result: CoinTransactionCreateDto | number | null
  ): result is CoinTransactionCreateDto {
    return (
      result != null && typeof result === 'object' && 'pricePerCoin' in result
    );
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

  get totalPrice(): number {
    if (!this.isCoinTransaction(this.previewTransaction)) return 0;
    return (
      this.previewTransaction.amount * this.previewTransaction.pricePerCoin
    );
  }
}
