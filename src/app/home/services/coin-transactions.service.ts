import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
}
