import { Component, Input } from '@angular/core';
import { CoinTransaction } from '../../../models/coin.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-card',
  imports: [CommonModule],
  templateUrl: './transaction-card.component.html',
  styleUrl: './transaction-card.component.scss',
})
export class TransactionCardComponent {
  @Input() transaction: CoinTransaction | null = null;
}
