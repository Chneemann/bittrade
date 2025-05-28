import { Component, OnInit } from '@angular/core';
import { CoinGeckoService } from '../../../core/services/external/coin-gecko.service';
import { Observable, shareReplay, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  Cached,
  CoinList,
  CoinListResponse,
  CoinPricesResponse,
} from '../../models/coin.model';
import { CoinsService } from '../../services/coins.service';
import { Router } from '@angular/router';
import { CoinCardComponent } from '../../../shared/components/coin-card/coin-card.component';

@Component({
  selector: 'app-market',
  imports: [CommonModule, CoinCardComponent],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss',
})
export class MarketComponent implements OnInit {
  coinPrices$!: Observable<Cached<CoinPricesResponse>>;
  coinList$!: Observable<CoinListResponse>;

  constructor(
    private coinGeckoService: CoinGeckoService,
    private coinsService: CoinsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCoinData();
  }

  private fetchCoinPrices(): void {
    this.coinPrices$ = this.coinList$.pipe(
      switchMap((coins) => {
        const coinIds = coins.map((c) => c.name.toLowerCase());
        return this.coinGeckoService.getCoinPrices(coinIds);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private loadCoinData(): void {
    this.coinList$ = this.coinsService
      .getCoinList()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.fetchCoinPrices();
  }

  getRelativeTime(timestamp: number | Date): string {
    if (!timestamp) return '';

    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minute(s)`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hour(s)`;
    return `${Math.floor(diffSec / 86400)} day(s)`;
  }

  updateCoinPrices(): void {
    this.coinPrices$ = this.coinList$.pipe(
      switchMap((coins) => {
        const coinIds = coins.map((c) => c.name.toLowerCase());
        return this.coinGeckoService.refreshCoinPricesAndMarketCharts(coinIds);
      })
    );
  }

  onCoinClick(coin: CoinList): void {
    if (!coin?.name) return;
    const coinName = coin.name.trim().toLowerCase().replace(/\s+/g, '-');
    this.router.navigate(['/home/coin', coinName]);
  }
}
