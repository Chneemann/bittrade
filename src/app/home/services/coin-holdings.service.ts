import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import { CoinHolding } from '../models/coin.model';
import { mapApiToCamel } from '../../core/utils/api-mapper';

@Injectable({ providedIn: 'root' })
export class CoinHoldingsService {
  constructor(private backendApi: BackendApiService) {}

  getAllHoldings(): Observable<CoinHolding[]> {
    return this.backendApi
      .get<CoinHolding[]>('/api/me/coin/holdings/')
      .pipe(
        map((list) => list.map((item) => mapApiToCamel<CoinHolding>(item)))
      );
  }

  getHoldingByCoin(symbol: string): Observable<CoinHolding> {
    return this.backendApi
      .get<CoinHolding>(`/api/me/coin/holding/${symbol}/`)
      .pipe(map((item) => mapApiToCamel<CoinHolding>(item)));
  }
}
