import { Component, OnInit } from '@angular/core';
import { CoinGeckoService } from '../../../core/services/external/coin-gecko.service';
import { Observable, shareReplay, Subscription, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  Cached,
  CoinList,
  CoinListResponse,
  CoinPricesResponse,
} from '../../models/coin.model';
import { CoinListService } from '../../services/coin-list.service';
import { Router } from '@angular/router';
import { CoinCardComponent } from '../../../shared/components/coins/coin-card/coin-card.component';
import { CoinUpdateService } from '../../services/coin-update.service';

@Component({
  selector: 'app-market',
  imports: [CommonModule, CoinCardComponent],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss',
})
export class MarketComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();

  averageChange24h: number | null = null;

  coinPrices$!: Observable<Cached<CoinPricesResponse>>;
  coinList$!: Observable<CoinListResponse>;

  constructor(
    private router: Router,
    private coinGeckoService: CoinGeckoService,
    private coinListService: CoinListService,
    private coinUpdateService: CoinUpdateService
  ) {}

  ngOnInit(): void {
    this.loadCoinData();
    this.subscribeToUpdatePrices();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private subscribeToUpdatePrices(): void {
    const sub = this.coinUpdateService.updatePrices$.subscribe(() => {
      this.updateCoinPrices();
    });
    this.subscriptions.add(sub);
  }

  private fetchCoinPrices(): void {
    this.coinPrices$ = this.coinList$.pipe(
      switchMap((coins) => {
        const coinIds = coins.map((c) => c.name.toLowerCase());
        return this.coinGeckoService.getCoinPrices(coinIds);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.coinPrices$.subscribe((cachedData) => {
      const data = cachedData.data;
      const changes = Object.values(data)
        .map((coin) => coin.usd_24h_change)
        .filter((change) => typeof change === 'number');

      const total = changes.reduce((sum, value) => sum + value, 0);
      const avg = changes.length > 0 ? total / changes.length : 0;

      this.averageChange24h = avg;
    });
  }

  private loadCoinData(): void {
    this.coinList$ = this.coinListService
      .getCoinList()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.fetchCoinPrices();
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

  get averageChangeClass(): string {
    if (this.averageChange24h === null) return '';
    return this.averageChange24h < 0 ? 'text-red' : 'text-green';
  }
}
