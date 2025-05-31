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
import { CoinsService } from '../../services/coins.service';
import { Router } from '@angular/router';
import { CoinCardComponent } from '../../../shared/components/coin-card/coin-card.component';
import { CoinUpdateService } from '../../services/coin-update.service';

@Component({
  selector: 'app-market',
  imports: [CommonModule, CoinCardComponent],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss',
})
export class MarketComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();

  coinPrices$!: Observable<Cached<CoinPricesResponse>>;
  coinList$!: Observable<CoinListResponse>;

  constructor(
    private router: Router,
    private coinGeckoService: CoinGeckoService,
    private coinsService: CoinsService,
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
  }

  private loadCoinData(): void {
    this.coinList$ = this.coinsService
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
}
