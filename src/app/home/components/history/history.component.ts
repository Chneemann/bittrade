import { ChangeDetectorRef, Component } from '@angular/core';
import { CoinTransactionService } from '../../services/coin-transactions.service';
import { CoinCardComponent } from '../transactions/coin-card/coin-card.component';
import { WalletService } from '../../services/wallet.service';
import { catchError, forkJoin, of } from 'rxjs';
import { CoinTransaction } from '../../models/coin.model';
import { WalletTransaction } from '../../models/wallet.model';

@Component({
  selector: 'app-history',
  imports: [CoinCardComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent {
  allCoinTransactions: CoinTransaction[] = [];
  allFiatTransactions: WalletTransaction[] = [];
  dataLoaded = false;

  constructor(
    private coinTransactionService: CoinTransactionService,
    private walletService: WalletService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllTransactions();
  }

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
      console.log(this.allCoinTransactions, this.allFiatTransactions);

      this.dataLoaded = true;
      this.cdr.detectChanges();
    });
  }
}
