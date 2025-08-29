import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import { Coin, CoinPricesResponse } from '../models/coin.model';

@Injectable({
  providedIn: 'root',
})
export class CoinCacheService {
  constructor(private backendApi: BackendApiService) {}

  getCoinCache(): Observable<CoinPricesResponse> {
    return this.backendApi.get<CoinPricesResponse>('/api/coins/cache/');
  }

  queueCoinCache(): Observable<string[]> {
    return this.backendApi.post<string[], {}>('/api/coins/cache/', {});
  }
}
