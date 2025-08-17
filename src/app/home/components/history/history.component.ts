import { ChangeDetectorRef, Component } from '@angular/core';
import { CoinTransactionService } from '../../services/coin-transactions.service';
import { CoinCardComponent } from '../transactions/coin-card/coin-card.component';
import { WalletService } from '../../services/wallet.service';
import { catchError, forkJoin, of } from 'rxjs';
import { CoinTransaction } from '../../models/coin.model';
import { WalletTransaction } from '../../models/wallet.model';
import { FiatCardComponent } from '../transactions/fiat-card/fiat-card.component';
import { SelectionTabsComponent } from '../../../shared/components/selection-tabs/selection-tabs.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

type MergedTransaction =
  | (CoinTransaction & { type: 'coin' })
  | (WalletTransaction & { type: 'fiat' });

@Component({
  selector: 'app-history',
  imports: [
    CoinCardComponent,
    FiatCardComponent,
    SelectionTabsComponent,
    PaginationComponent,
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent {
  private allCoinTransactions: CoinTransaction[] = [];
  private allFiatTransactions: WalletTransaction[] = [];

  dataLoaded = false;

  currentPage = 1;
  itemsPerPage = 8;

  options: string[] = ['all', 'fiat', 'coin'];
  activeOption: string = 'all';

  constructor(
    private coinTransactionService: CoinTransactionService,
    private walletService: WalletService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllTransactions();
  }

  // Public methods
  loadAllTransactions(): void {
    forkJoin({
      coinTxs: this.coinTransactionService
        .getCoinTransactions()
        .pipe(catchError(() => of([] as CoinTransaction[]))),
      fiatTxs: this.walletService
        .getWalletTransactionsBySource('fiat')
        .pipe(catchError(() => of([] as WalletTransaction[]))),
    }).subscribe(({ coinTxs, fiatTxs }) => {
      this.allCoinTransactions = coinTxs;
      this.allFiatTransactions = fiatTxs;
      this.dataLoaded = true;
      this.cdr.detectChanges();
    });
  }

  // Public helper methods
  isCoin(tx: MergedTransaction): tx is CoinTransaction & { type: 'coin' } {
    return (tx as any).type === 'coin';
  }

  isFiat(tx: MergedTransaction): tx is WalletTransaction & { type: 'fiat' } {
    return (tx as any).type === 'fiat';
  }

  onFilterTransactions(option: string) {
    this.activeOption = option;
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  // Private helper methods
  private mergeAndSortTransactions(
    coinTxs: CoinTransaction[],
    fiatTxs: WalletTransaction[]
  ): MergedTransaction[] {
    return (
      [
        ...coinTxs.map((tx) => ({ ...tx, type: 'coin' as const })),
        ...fiatTxs.map((tx) => ({ ...tx, type: 'fiat' as const })),
      ] as MergedTransaction[]
    ).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  private filterTransactions(
    transactions: MergedTransaction[],
    option: string
  ): MergedTransaction[] {
    if (option === 'all') return transactions;
    return transactions.filter((tx) => tx.type === option);
  }

  // Getters
  get sortedMergedTransactions(): MergedTransaction[] {
    const merged = this.mergeAndSortTransactions(
      this.allCoinTransactions,
      this.allFiatTransactions
    );
    return this.filterTransactions(merged, this.activeOption);
  }

  get pagedTransactions(): MergedTransaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.sortedMergedTransactions.slice(start, end);
  }
}
