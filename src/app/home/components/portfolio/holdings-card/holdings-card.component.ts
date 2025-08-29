import { Component, Input } from '@angular/core';
import { CoinHolding, CoinPricesResponse } from '../../../models/coin.model';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../../services/wallet.service';
import { Observable } from 'rxjs';
import { Wallet } from '../../../models/wallet.model';
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-holdings-card',
  imports: [CommonModule, RouterLink, PrimaryButtonComponent],
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

  // Getters
  get totalPortfolioAmount(): number {
    return this.holdings.reduce((total, holding) => {
      const price =
        this.prices[holding.coin.name.toLowerCase()]?.market_data
          ?.current_price?.['usd'] ?? 0;
      return total + price * holding.amount;
    }, 0);
  }

  get totalPortfolioChange(): number {
    const current = this.totalPortfolioAmount;
    const previous = this.totalInvestedValue;
    return (current - previous) / previous;
  }

  get totalInvestedValue(): number {
    return this.holdings.reduce(
      (sum, h) => sum + h.amount * h.averageBuyPrice,
      0
    );
  }
}
