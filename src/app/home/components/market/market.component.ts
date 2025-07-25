import { Component, OnInit } from '@angular/core';
import { CoinGeckoService } from '../../../core/services/external/coin-gecko.service';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  shareReplay,
  Subscription,
  switchMap,
} from 'rxjs';
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
import { MarketHeaderComponent } from './market-header/market-header.component';
import { SelectionTabsComponent } from '../../../shared/components/selection-tabs/selection-tabs.component';

@Component({
  selector: 'app-market',
  imports: [
    CommonModule,
    CoinCardComponent,
    MarketHeaderComponent,
    SelectionTabsComponent,
  ],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss',
})
export class MarketComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();

  averageChange24h: number | null = null;
  options: string[] = ['all', 'gainers', 'losers'];
  activeOption: string = 'all';

  private searchText$ = new BehaviorSubject<string>('');

  coinPrices$!: Observable<Cached<CoinPricesResponse>>;
  coinList$!: Observable<CoinListResponse>;
  filteredCoins$!: Observable<CoinListResponse>;

  constructor(
    private router: Router,
    private coinGeckoService: CoinGeckoService,
    private coinListService: CoinListService,
    private coinUpdateService: CoinUpdateService
  ) {}

  ngOnInit(): void {
    this.loadCoinData();
    this.subscribeToUpdatePrices();
    this.setupFilteredCoins();
  }

  private setupFilteredCoins(): void {
    this.filteredCoins$ = combineLatest([
      this.coinList$,
      this.searchText$,
      this.coinPrices$,
    ]).pipe(
      map(([coins, search, priceData]) => {
        const filteredBySearch = coins.filter((coin) => {
          return (
            coin.name.toLowerCase().includes(search) ||
            coin.symbol.toLowerCase().includes(search)
          );
        });
        return this.filterByOption(filteredBySearch, priceData.data);
      })
    );
  }

  private filterByOption(
    coins: CoinList[],
    priceData: CoinPricesResponse
  ): CoinList[] {
    switch (this.activeOption) {
      case 'gainers':
        return coins.filter(
          (coin) => priceData[coin.name.toLowerCase()]?.usd_24h_change > 0
        );
      case 'losers':
        return coins.filter(
          (coin) => priceData[coin.name.toLowerCase()]?.usd_24h_change < 0
        );
      default:
        return coins;
    }
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

    this.averageChange();
  }

  private averageChange(): void {
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

  onSearch(searchText: string) {
    this.searchText$.next(searchText.toLowerCase());
  }

  onFilterTransactions(option: string) {
    this.activeOption = option;
    this.searchText$.next(this.searchText$.value);
  }
}
