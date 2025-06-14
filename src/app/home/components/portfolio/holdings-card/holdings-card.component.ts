import { Component, Input } from '@angular/core';
import { CoinHolding, CoinPricesResponse } from '../../../models/coin.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-holdings-card',
  imports: [CommonModule],
  templateUrl: './holdings-card.component.html',
  styleUrl: './holdings-card.component.scss',
})
export class HoldingsCardComponent {
  @Input() prices: CoinPricesResponse = {};
  @Input() holdings: CoinHolding[] = [];

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
