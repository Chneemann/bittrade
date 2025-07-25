import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  catchError,
  combineLatest,
  EMPTY,
  filter,
  forkJoin,
  map,
  Observable,
  shareReplay,
  Subscription,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { CoinGeckoService } from '../../../core/services/external/coin-gecko.service';
import { Coin, CoinHolding, CoinListResponse } from '../../models/coin.model';
import { CoinListService } from '../../services/coin-list.service';
import { CoinUpdateService } from '../../services/coin-update.service';
import { CoinDetailChartComponent } from './coin-detail-chart/coin-detail-chart.component';
import { CoinGeckoCacheService } from '../../../core/services/external/coin-gecko-cache.service';
import { CoinDetailHoldingsComponent } from './coin-detail-holdings/coin-detail-holdings.component';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-coin-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CoinDetailChartComponent,
    CoinDetailHoldingsComponent,
    PrimaryButtonComponent,
  ],
  templateUrl: './coin-detail.component.html',
  styleUrl: './coin-detail.component.scss',
})
export class CoinDetailComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  coinList$!: Observable<CoinListResponse>;
  currentCoin$!: Observable<Coin>;

  selectedTime: string = '1'; // default: 1 day
  chartData: { date: Date; price: number }[] = [];
  userHolding: CoinHolding | null = null;
  isHoldingLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private coinListService: CoinListService,
    private coinGeckoService: CoinGeckoService,
    private coinGeckoCacheService: CoinGeckoCacheService,
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

  onIntervalChange(interval: string): void {
    this.selectedTime = interval;
    this.updateCoinChart();
  }

  private subscribeToUpdatePrice(): void {
    const sub = this.coinUpdateService.updatePrices$.subscribe(() => {
      this.updateCoinPrice();
    });
    this.subscriptions.add(sub);
  }

  private loadCoinList(): Observable<CoinListResponse> {
    return this.coinListService
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

  updateCoinChart(): void {
    const id = this.route.snapshot.paramMap.get('id')?.toLowerCase() ?? '';
    if (!id) return;

    this.coinGeckoService.getMarketChartData(id, this.selectedTime).subscribe({
      next: (chartResponse) => {
        this.chartData = chartResponse.data.prices.map((item: number[]) => ({
          date: new Date(item[0]),
          price: item[1],
        }));
      },
      error: (err) => {
        console.error('Error updating coin chart:', err);
      },
    });
  }

  updateCoinPrice(): void {
    this.currentCoin$ = this.route.paramMap.pipe(
      map((params) => params.get('id')?.toLowerCase()),
      filter((id): id is string => !!id),
      tap((id) => this.coinGeckoCacheService.clearCoinMarketChartCache(id)),
      switchMap((id) => this.coinGeckoService.refreshCoinData(id)),
      tap(() => {
        this.updateCoinChart();
      }),
      map((response) => response.data)
    );
  }

  onUserHoldingLoaded(holding: CoinHolding | null) {
    this.userHolding = holding;
  }
}
