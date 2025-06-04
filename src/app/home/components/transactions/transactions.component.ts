import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionCardComponent } from './transaction-card/transaction-card.component';
import { CoinTransactionService } from '../../services/coin-transactions.service';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, TransactionCardComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  selectedCoinId: string | null = null;
  transactions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private coinTransactionService: CoinTransactionService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.selectedCoinId = params.get('id');

      if (this.selectedCoinId) {
        this.loadTransactions(this.selectedCoinId);
      }
    });
  }

  loadTransactions(coinId: string): void {
    this.coinTransactionService
      .getTransactionByCoin(coinId)
      .subscribe((txs) => {
        this.transactions = txs;
      });
  }
}
