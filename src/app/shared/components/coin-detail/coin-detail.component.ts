import { Component, OnInit } from '@angular/core';
import {
  catchError,
  combineLatest,
  EMPTY,
  map,
  Observable,
  shareReplay,
  Subscription,
  switchMap,
  throwError,
} from 'rxjs';
import { CoinGeckoService } from '../../../core/services/external/coin-gecko.service';
import { Coin, CoinListResponse } from '../../../home/models/coin.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { CoinsService } from '../../../home/services/coins.service';
import { CoinUpdateService } from '../../../home/services/coin-update.service';

@Component({
  selector: 'app-coin-detail',
  imports: [CommonModule],
  templateUrl: './coin-detail.component.html',
  styleUrl: './coin-detail.component.scss',
})
export class CoinDetailComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();

  coinList$!: Observable<CoinListResponse>;
  currentCoin$!: Observable<Coin>;

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
        return this.coinGeckoService
          .getCoinData(id)
          .pipe(map((cached) => cached.data));
      }),
      catchError((err) => {
        if (window.history.length > 1) {
          this.location.back();
        } else {
          this.router.navigate(['/home']); // fallback
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
