import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import { Coin } from '../models/coin.model';

@Injectable({
  providedIn: 'root',
})
export class CoinCacheService {
  constructor(private backendApi: BackendApiService) {}

  getCoinCache(): Observable<Record<string, Coin>> {
    return this.backendApi.get<Record<string, Coin>>('/api/coins/cache/');
  }

  queueCoinCache(): Observable<string[]> {
    return this.backendApi.post<string[], {}>('/api/coins/cache/queue/', {});
  }
}
