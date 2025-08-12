import { ChangeDetectorRef, Component } from '@angular/core';
import { CoinTransactionService } from '../../services/coin-transactions.service';
import { CoinCardComponent } from '../transactions/coin-card/coin-card.component';

@Component({
  selector: 'app-history',
  imports: [CoinCardComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent {
  allTransactions: any[] = [];
  dataLoaded = false;

  constructor(
    private coinTransactionService: CoinTransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllTransactions();
  }

  loadAllTransactions(): void {
    this.coinTransactionService.getAllTransactions().subscribe((txs) => {
      this.allTransactions = txs;
      this.dataLoaded = true;
      this.cdr.detectChanges();
    });
  }
}
