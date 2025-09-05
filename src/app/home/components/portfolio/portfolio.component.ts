import { Component } from '@angular/core';
import {
  combineLatest,
  map,
  Observable,
  shareReplay,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {
  CoinHolding,
  CoinList,
  CoinListResponse,
  CoinPricesResponse,
} from '../../models/coin.model';
import { CoinListService } from '../../services/coin-list.service';
import { CoinUpdateService } from '../../services/coin-update.service';
import { CoinCardComponent } from '../../../shared/components/coins/coin-card/coin-card.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CoinHoldingsService } from '../../services/coin-holdings.service';
import { HoldingsCardComponent } from './holdings-card/holdings-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { CoinCacheService } from '../../services/coin-cache.service';

@Component({
  selector: 'app-portfolio',
  imports: [
    CommonModule,
    CoinCardComponent,
    HoldingsCardComponent,
    LoadingComponent,
  ],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent {
  private subscriptions: Subscription = new Subscription();

  averageChange24h: number | null = null;

  coinPrices$!: Observable<CoinPricesResponse>;
  coinList$!: Observable<CoinListResponse>;
  holdings$!: Observable<CoinHolding[]>;
  filteredCoins$!: Observable<CoinListResponse>;

  constructor(
    private router: Router,
    private coinListService: CoinListService,
    private coinUpdateService: CoinUpdateService,
    private coinHoldingsService: CoinHoldingsService,
    private coinCacheService: CoinCacheService
  ) {}

  ngOnInit(): void {
    this.loadCoinData();
    this.loadHoldings();
    this.filterCoinsByHoldings();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private filterCoinsByHoldings(): void {
    this.filteredCoins$ = combineLatest([this.coinList$, this.holdings$]).pipe(
      map(([coins, holdings]) =>
        coins.filter((c) =>
          holdings.some((h) => h.coin.symbol === c.symbol && h.amount > 0)
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private fetchCoinPrices(): void {
    this.coinPrices$ = this.coinList$.pipe(
      switchMap(() => this.coinCacheService.getCoinCache()),
      tap((prices) => {
        const maxCachedAt = Math.max(
          ...Object.values(prices).map((p) => p.cached_at ?? 0)
        );
        this.coinUpdateService.setLastUpdate(maxCachedAt);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.averageChange();
  }

  private averageChange(): void {
    this.coinPrices$.subscribe((prices) => {
      const changes = Object.values(prices)
        .map(
          (coin) => coin.data.market_data.price_change_24h_in_currency['usd']
        )
        .filter((change) => typeof change === 'number');

      const total = changes.reduce((sum, value) => sum + value, 0);
      this.averageChange24h = changes.length > 0 ? total / changes.length : 0;
    });
  }

  private loadCoinData(): void {
    this.coinList$ = this.coinListService
      .getCoinList()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.fetchCoinPrices();
  }

  private loadHoldings(): void {
    this.holdings$ = this.coinHoldingsService.getAllHoldings().pipe(
      map((holdingMap) => Object.values(holdingMap)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  updateCoinPrices(): void {
    //  this.coinPrices$ = this.coinList$.pipe(
    //    switchMap((coins) => {
    //      const coinIds = coins.map((c) => c.name.toLowerCase());
    //      return this.coinGeckoService.refreshCoinPricesAndMarketCharts(coinIds);
    //    })
    //  );
  }

  onCoinClick(coin: CoinList): void {
    if (!coin?.name) return;
    const coinName = coin.name.trim().toLowerCase().replace(/\s+/g, '-');
    this.router.navigate(['/home/coin', coinName]);
  }

  getHoldingAmount(symbol: string, holdings: CoinHolding[]): number {
    const holding = holdings.find((h) => h.coin.symbol === symbol);
    return holding?.amount ?? 0;
  }

  getPriceAmount(
    slug: string,
    symbol: string,
    prices: CoinPricesResponse,
    holdings: CoinHolding[]
  ): number {
    const coinPrice =
      prices[slug.toLowerCase()].data.market_data.current_price['usd'] ?? 0;
    const holdingAmount = this.getHoldingAmount(symbol, holdings);

    return coinPrice * holdingAmount;
  }
}
