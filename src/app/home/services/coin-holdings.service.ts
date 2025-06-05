import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import { CoinTransaction } from '../models/coin.model';

@Injectable({ providedIn: 'root' })
export class CoinHoldingsService {
  constructor(private backendApi: BackendApiService) {}

  getAllHoldings(): Observable<CoinTransaction[]> {
    return this.backendApi.get<CoinTransaction[]>('/api/me/holdings/');
  }

  getHoldingByCoin(symbol: string): Observable<CoinTransaction[]> {
    return this.backendApi.get<CoinTransaction[]>(
      `/api/me/holdings/${symbol}/`
    );
  }
}
