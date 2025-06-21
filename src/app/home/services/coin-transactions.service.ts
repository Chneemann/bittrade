import { Injectable } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import { CoinTransaction } from '../models/coin.model';

@Injectable({ providedIn: 'root' })
export class CoinTransactionService {
  constructor(private backendApi: BackendApiService) {}

  getAllTransactions(): Observable<CoinTransaction[]> {
    return this.backendApi.get<CoinTransaction[]>('/api/me/transactions/');
  }

  getTransactionByCoin(symbol: string): Observable<CoinTransaction[]> {
    return this.backendApi.get<CoinTransaction[]>(
      `/api/me/transactions/${symbol}/`
    );
  }

  buyCoin(coinId: string, amountUSD: number): Observable<void> {
    return of(void 0).pipe(
      delay(1000),
      tap(() => console.log('buyCoin', coinId, amountUSD))
    );
  }

  sellCoin(coinId: string, amountUSD: number): Observable<void> {
    return of(void 0).pipe(
      delay(1000),
      tap(() => console.log('sellCoin', coinId, amountUSD))
    );
  }
}
