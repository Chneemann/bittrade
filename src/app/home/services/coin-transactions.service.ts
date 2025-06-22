import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import {
  CoinTransaction,
  CoinTransactionCreateDto,
} from '../models/coin.model';

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

  addTransaction(
    coinId: string,
    tx: Omit<CoinTransactionCreateDto, 'coin_id'>
  ): Observable<CoinTransaction> {
    return this.backendApi.post<
      CoinTransaction,
      Omit<CoinTransactionCreateDto, 'coin_id'>
    >(`/api/me/transactions/${coinId}/`, tx);
  }
}
