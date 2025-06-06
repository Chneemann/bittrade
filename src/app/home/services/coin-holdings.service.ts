import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import { CoinHolding } from '../models/coin.model';

@Injectable({ providedIn: 'root' })
export class CoinHoldingsService {
  constructor(private backendApi: BackendApiService) {}

  getAllHoldings(): Observable<CoinHolding> {
    return this.backendApi.get<CoinHolding>('/api/me/holdings/');
  }

  getHoldingByCoin(symbol: string): Observable<CoinHolding> {
    return this.backendApi.get<CoinHolding>(`/api/me/holdings/${symbol}/`);
  }
}
