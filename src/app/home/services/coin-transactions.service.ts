import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import {
  CoinTransaction,
  CoinTransactionCreateDto,
} from '../models/coin.model';
import { mapApiToCamel, mapCamelToApi } from '../../core/utils/api-mapper';

@Injectable({ providedIn: 'root' })
export class CoinTransactionService {
  constructor(private backendApi: BackendApiService) {}

  getCoinTransactions(): Observable<CoinTransaction[]> {
    return this.backendApi
      .get<CoinTransaction[]>('/api/me/coin/transactions/')
      .pipe(
        map((list) => list.map((tx) => mapApiToCamel<CoinTransaction>(tx)))
      );
  }

  getTransactionsByCoin(symbol: string): Observable<CoinTransaction[]> {
    return this.backendApi
      .get<CoinTransaction[]>(`/api/me/coin/transaction/${symbol}/`)
      .pipe(
        map((list) => list.map((tx) => mapApiToCamel<CoinTransaction>(tx)))
      );
  }

  addCoinTransaction(
    coinId: string,
    tx: CoinTransactionCreateDto
  ): Observable<CoinTransaction> {
    const payload = mapCamelToApi(tx);

    return this.backendApi
      .post<CoinTransaction, any>(
        `/api/me/coin/transaction/${coinId}/`,
        payload
      )
      .pipe(map((apiResponse) => mapApiToCamel<CoinTransaction>(apiResponse)));
  }
}
