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

  // Cache lifetime in milliseconds (24h)
  private readonly TTL_MS = 24 * 60 * 60 * 1000;

  constructor(private http: HttpClient) {}

  /**
   * Builds a cache key string from a namespace and parameters.
   * Parameters are sorted alphabetically to ensure consistent keys.
   * @param namespace Cache namespace (e.g. 'coinData')
   * @param paramsObj Object of parameters to include in the key
   * @returns A string key for caching
   */
  private buildCacheKey(
    namespace: string,
    paramsObj: Readonly<Record<string, string>>
  ): string {
    return (
      `${namespace}:` +
      Object.entries(paramsObj)
        .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
        .map(([key, val]) => `${key}=${val}`)
        .join('&')
    );
  }

  /**
   * Builds HttpParams from an object, including the API key if available.
   * @param paramsObj Object of query parameters
   * @returns HttpParams instance with all parameters set
   */
  private buildHttpParams(
    paramsObj: Readonly<Record<string, string>>
  ): HttpParams {
    let params = new HttpParams();
    Object.entries(paramsObj).forEach(([key, val]) => {
      if (val) params = params.set(key, val);
    });
    if (this.apiKey) params = params.set('x_cg_demo_api_key', this.apiKey);
    return params;
  }

  /**
   * Fetches detailed coin data by coin ID.
   * Returns cached data if available and fresh.
   * @param coinId The coin identifier string
   * @returns Observable emitting CoinData
   */
  getCoinData(coinId: string): Observable<CoinData> {
    const key = this.buildCacheKey('coinData', { id: coinId });
    const cached = this.getCachedData<CoinData>(key);
    if (cached) return of(cached);

    const params = this.buildHttpParams({});

    return this.http
      .get<CoinData>(`${this.baseUrl}/coins/${coinId}`, { params })
      .pipe(
        tap((data) => this.setCache(key, data)),
        shareReplay(1),
        catchError(this.handleError)
      );
  }

  /**
   * Fetches current prices for multiple coins in a given currency.
   * Returns cached data if available and fresh.
   * @param coinIds Array of coin IDs to fetch prices for
   * @param currency Target currency (default 'usd')
   * @returns Observable emitting an object mapping coin IDs to their price data
   */
  getCoinPrices(
    coinIds: string[],
    currency: string = 'usd'
  ): Observable<Record<string, Record<string, number>>> {
    const sortedIds = [...coinIds].sort().join(',');
    const key = this.buildCacheKey('coinPrices', { ids: sortedIds, currency });

    const cached =
      this.getCachedData<Record<string, Record<string, number>>>(key);
    if (cached) return of(cached);

    const params = this.buildHttpParams({
      ids: sortedIds,
      vs_currencies: currency,
    });

    return this.http
      .get<Record<string, Record<string, number>>>(
        `${this.baseUrl}/simple/price`,
        { params }
      )
      .pipe(
        tap((data) => this.setCache(key, data)),
        shareReplay(1),
        catchError(this.handleError)
      );
  }

  /**
   * Attempts to retrieve cached data from localStorage.
   * Returns null if no cache exists or cache is expired or invalid.
   * @param key Cache key string
   * @returns Cached data of type T or null
   */
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

  /**
   * Stores data in localStorage with a timestamp.
   * @param key Cache key string
   * @param data Data to cache
   */
  private setCache<T>(key: string, data: T): void {
    const item: CacheItem<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Handles HTTP errors from API calls.
   * Logs the error and returns an Observable that errors with a descriptive message.
   * @param error The error object
   * @returns Observable that errors with a message
   */
  private handleError(error: any): Observable<never> {
    console.error('CoinGecko API error:', error);
    const message =
      error?.error?.error || error?.message || 'Error with CoinGecko';
    return throwError(() => new Error(message));
  }
}
