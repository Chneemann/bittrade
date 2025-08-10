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
    return this.backendApi.get<CoinTransaction[]>('/api/me/coin/transactions/');
  }

  getTransactionByCoin(symbol: string): Observable<CoinTransaction[]> {
    return this.backendApi.get<CoinTransaction[]>(
      `/api/me/coin/transaction/${symbol}/`
    );
  }

  addTransaction(
    coinId: string,
    tx: CoinTransactionCreateDto
  ): Observable<CoinTransaction> {
    return this.backendApi.post<CoinTransaction, CoinTransactionCreateDto>(
      `/api/me/coin/transaction/${coinId}/`,
      tx
    );
  }
}
