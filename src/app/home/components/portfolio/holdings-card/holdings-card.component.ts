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

  getTotalPortfolioAmount(
    prices: CoinPricesResponse,
    holdings: CoinHolding[]
  ): number {
    return holdings.reduce((total, holding) => {
      const slug = holding.coin.name.toLowerCase();
      const coinPrice = prices[slug]?.usd ?? 0;
      return total + coinPrice * holding.amount;
    }, 0);
  }

  getTotalPortfolioChange24h(
    prices: CoinPricesResponse,
    holdings: CoinHolding[]
  ): number {
    let totalValue = 0;
    let totalValueYesterday = 0;

    for (const holding of holdings) {
      const slug = holding.coin.name.toLowerCase();
      const price = prices[slug]?.usd ?? 0;
      const changePercent = prices[slug]?.usd_24h_change ?? 0;
      const amount = holding.amount;

      const currentValue = price * amount;
      const valueYesterday = currentValue / (1 + changePercent / 100);

      totalValue += currentValue;
      totalValueYesterday += valueYesterday;
    }

    if (totalValueYesterday === 0) return 0;

    const change =
      ((totalValue - totalValueYesterday) / totalValueYesterday) * 100;
    return change;
  }

  getTotalInvestedValue(holdings: CoinHolding[]): number {
    return holdings.reduce((total, holding) => {
      return total + holding.amount * holding.average_buy_price;
    }, 0);
  }
}
