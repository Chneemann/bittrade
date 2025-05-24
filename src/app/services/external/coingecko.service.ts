import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CoinData } from '../../components/models/coin.model';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class CoinGeckoService {
  private readonly baseUrl = environment.coinGeckoApiUrl;
  private readonly apiKey = environment.coinGeckoApiKey;

  private readonly TTL_MS = 24 * 60 * 60 * 1000;

  constructor(private http: HttpClient) {}

  getCoinData(coinId: string): Observable<CoinData> {
    const key = `coinData-${coinId}`;
    const cached = this.getCachedData<CoinData>(key);
    if (cached) return of(cached);

    const params = this.apiKey
      ? new HttpParams().set('x_cg_demo_api_key', this.apiKey)
      : undefined;

    return this.http
      .get<CoinData>(`${this.baseUrl}/coins/${coinId}`, { params })
      .pipe(
        tap((data) => this.setCache(key, data)),
        shareReplay(1),
        catchError(this.handleError)
      );
  }

  private getCachedData<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const { data, timestamp }: CacheItem<T> = JSON.parse(raw);
      if (Date.now() - timestamp < this.TTL_MS) return data;
      localStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    const item: CacheItem<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(item));
  }

  private handleError(error: any) {
    console.error('CoinGecko API error:', error);
    const message =
      error?.error?.error || error?.message || 'Error with CoinGecko';
    return throwError(() => new Error(message));
  }
}
