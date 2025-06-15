import { Component, Input } from '@angular/core';
import { CoinHolding, CoinPricesResponse } from '../../../models/coin.model';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../../services/wallet.service';
import { Observable } from 'rxjs';
import { Wallet } from '../../../models/wallet.model';
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-holdings-card',
  imports: [CommonModule, PrimaryButtonComponent],
  templateUrl: './holdings-card.component.html',
  styleUrl: './holdings-card.component.scss',
})
export class HoldingsCardComponent {
  @Input() prices: CoinPricesResponse = {};
  @Input() holdings: CoinHolding[] = [];

  wallet$!: Observable<Wallet>;

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.wallet$ = this.walletService.getWallet();
  }

  private getSlug(name: string): string {
    return name.toLowerCase();
  }

  get totalPortfolioAmount(): number {
    return this.holdings.reduce((total, holding) => {
      const price = this.prices[this.getSlug(holding.coin.name)]?.usd ?? 0;
      return total + price * holding.amount;
    }, 0);
  }

  get totalPortfolioChange24h(): number {
    let current = 0;
    let previous = 0;

    for (const { coin, amount } of this.holdings) {
      const data = this.prices[this.getSlug(coin.name)];
      if (!data) continue;

      const valueNow = data.usd * amount;
      const valueBefore = valueNow / (1 + (data.usd_24h_change ?? 0) / 100);

      current += valueNow;
      previous += valueBefore;
    }

    return previous === 0 ? 0 : ((current - previous) / previous) * 100;
  }

  get totalInvestedValue(): number {
    return this.holdings.reduce(
      (sum, h) => sum + h.amount * h.average_buy_price,
      0
    );
  }
}
