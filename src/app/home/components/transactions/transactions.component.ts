import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionCardComponent } from './transaction-card/transaction-card.component';
import { CoinTransactionService } from '../../services/coin-transactions.service';
import { SelectionTabsComponent } from '../../../shared/components/selection-tabs/selection-tabs.component';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, TransactionCardComponent, SelectionTabsComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  selectedCoinId: string | null = null;
  allTransactions: any[] = [];
  transactions: any[] = [];

  dataLoaded = false;
  options: string[] = ['all', 'buy', 'sell'];
  activeOption: string = 'all';

  constructor(
    private route: ActivatedRoute,
    private coinTransactionService: CoinTransactionService,
    private cdr: ChangeDetectorRef
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
        this.allTransactions = txs;
        this.applyFilter();
        this.dataLoaded = true;
        this.cdr.detectChanges();
      });
  }

  onFilterTransactions(option: string) {
    this.activeOption = option;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeOption === 'all') {
      this.transactions = [...this.allTransactions];
    } else {
      this.transactions = this.allTransactions.filter(
        (tx) => tx.transaction_type === this.activeOption
      );
    }
  }
}
