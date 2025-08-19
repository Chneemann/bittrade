import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoinCardComponent } from './coin-card/coin-card.component';
import { CoinTransactionService } from '../../services/coin-transactions.service';
import { SelectionTabsComponent } from '../../../shared/components/selection-tabs/selection-tabs.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-coin-transactions',
  imports: [
    CommonModule,
    CoinCardComponent,
    SelectionTabsComponent,
    PaginationComponent,
    LoadingComponent,
  ],
  templateUrl: './coin-transactions.component.html',
  styleUrl: './coin-transactions.component.scss',
})
export class CoinTransactionsComponent implements OnInit {
  selectedCoinId: string | null = null;
  allTransactions: any[] = [];
  filteredTransactions: any[] = [];

  dataLoaded = false;

  currentPage = 1;
  itemsPerPage = 8;

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

  // Public methods
  onFilterTransactions(option: string): void {
    this.activeOption = option;
    this.currentPage = 1;
    this.applyFilter();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  // Public helper methods
  loadTransactions(coinId: string): void {
    this.coinTransactionService
      .getTransactionsByCoin(coinId)
      .subscribe((txs) => {
        this.allTransactions = txs;
        this.applyFilter();
        this.dataLoaded = true;
        this.cdr.detectChanges();
      });
  }

  applyFilter(): void {
    if (this.activeOption === 'all') {
      this.filteredTransactions = [...this.allTransactions];
    } else {
      this.filteredTransactions = this.allTransactions.filter(
        (tx) => tx.transaction_type === this.activeOption
      );
    }
  }

  // Getters
  get pagedTransactions(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredTransactions.slice(start, end);
  }
}
