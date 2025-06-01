import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  catchError,
  combineLatest,
  EMPTY,
  forkJoin,
  map,
  Observable,
  shareReplay,
  Subscription,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { CoinGeckoService } from '../../../../core/services/external/coin-gecko.service';
import { Coin, CoinListResponse } from '../../../../home/models/coin.model';
import { CoinsService } from '../../../../home/services/coins.service';
import { CoinUpdateService } from '../../../../home/services/coin-update.service';
import { SimpleChartComponent } from '../../charts/simple-chart/simple-chart.component';

@Component({
  selector: 'app-coin-detail',
  standalone: true,
  imports: [CommonModule, SimpleChartComponent],
  templateUrl: './coin-detail.component.html',
  styleUrl: './coin-detail.component.scss',
})
export class CoinDetailComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  coinList$!: Observable<CoinListResponse>;
  currentCoin$!: Observable<Coin>;

  selectedTime: string = '1'; // default: 1 day
  chartData: { date: Date; price: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private coinsService: CoinsService,
    private coinGeckoService: CoinGeckoService,
    private coinUpdateService: CoinUpdateService
  ) {}

  ngOnInit(): void {
    this.coinList$ = this.loadCoinList();
    this.currentCoin$ = this.currentCoinStream();
    this.subscribeToUpdatePrice();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private subscribeToUpdatePrice(): void {
    const sub = this.coinUpdateService.updatePrices$.subscribe(() => {
      this.updateCoinPrice();
    });
    this.subscriptions.add(sub);
  }

  private loadCoinList(): Observable<CoinListResponse> {
    return this.coinsService
      .getCoinList()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private currentCoinStream(): Observable<Coin> {
    return combineLatest([
      this.route.paramMap.pipe(
        map((params) => params.get('id')?.toLowerCase() ?? '')
      ),
      this.coinList$,
    ]).pipe(
      switchMap(([id, coinListResponse]) => {
        const allowedIds = coinListResponse.map((c) => c.name.toLowerCase());
        if (!allowedIds.includes(id)) {
          return throwError(() => new Error('Coin not found'));
        }

        return forkJoin({
          coin: this.coinGeckoService
            .getCoinData(id)
            .pipe(map((res) => res.data)),
          chart: this.coinGeckoService.getMarketChartData(
            id,
            this.selectedTime
          ),
        });
      }),
      tap(({ chart }) => {
        this.chartData = chart.data.prices.map((item: number[]) => ({
          date: new Date(item[0]),
          price: item[1],
        }));
      }),
      map(({ coin }) => coin),
      catchError((err) => {
        if (window.history.length > 1) {
          this.location.back();
        } else {
          this.router.navigate(['/home']);
        }
        return EMPTY;
      })
    );
  }

  updateCoinPrice(): void {
    this.currentCoin$ = this.route.paramMap.pipe(
      map((params) => params.get('id')?.toLowerCase() ?? ''),
      switchMap((id) => this.coinGeckoService.refreshCoinData(id)),
      map((cached) => cached.data)
    );
  }
}
