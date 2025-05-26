import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Cached,
  Coin,
  CoinPricesResponse,
} from '../../components/models/coin.model';

@Injectable({
  providedIn: 'root',
})
export class CoinGeckoService {
  private readonly baseUrl = environment.coinGeckoApiUrl;
  private readonly apiKey = environment.coinGeckoApiKey;

  // Cache lifetime in milliseconds (24h)
  private readonly TTL_MS = 24 * 60 * 60 * 1000;
  private readonly STORAGE_KEY_COIN = 'cachedCoin';
  private readonly STORAGE_KEY_COIN_PRICES = 'cachedCoinPrices';

  constructor(private http: HttpClient) {}

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
  getCoinData(coinId: string): Observable<Cached<Coin>> {
    const formattedId = this.formatCoinId(coinId);
    const key = `${this.STORAGE_KEY_COIN}${formattedId}`;
    const cached = this.getCachedData<Coin>(key);

    if (cached) {
      return of({ data: cached.data, timestamp: cached.timestamp });
    }

    const params = this.buildHttpParams({});

    return this.http
      .get<Coin>(`${this.baseUrl}/coins/${coinId}`, { params })
      .pipe(
        tap((data) => this.setCache(key, data)),
        map((data) => ({ data, timestamp: Date.now() })),
        shareReplay(1),
        catchError(this.handleError)
      );
  }

  /**
   * Fetches current prices and 24h price change percentage for multiple coins in a given currency.
   * Returns cached data if available and fresh.
   * @param coinIds Array of coin IDs to fetch prices for
   * @param currency Target currency (default 'usd')
   * @returns Observable emitting an object mapping coin IDs to their price data, including 24h change percentage
   */
  getCoinPrices(coinIds: string[]): Observable<Cached<CoinPricesResponse>> {
    const cached = this.getCachedData<CoinPricesResponse>(
      this.STORAGE_KEY_COIN_PRICES
    );

    if (cached) {
      return of({ data: cached.data, timestamp: cached.timestamp });
    }

    const params = this.buildHttpParams({
      ids: coinIds.join(','),
      vs_currencies: 'usd',
      include_24hr_change: 'true',
    });

    return this.http
      .get<CoinPricesResponse>(`${this.baseUrl}/simple/price`, { params })
      .pipe(
        tap((data) => this.setCache(this.STORAGE_KEY_COIN_PRICES, data)),
        map((data) => ({ data, timestamp: Date.now() })),
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
  private getCachedData<T>(key: string): Cached<T> | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const cacheItem: Cached<T> = JSON.parse(raw);
      if (Date.now() - cacheItem.timestamp < this.TTL_MS) {
        return cacheItem;
      }
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
    const item: Cached<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Formats a coin ID with uppercase first letter and lowercase rest.
   * @param id The coin ID string
   * @returns Formatted coin ID
   */
  private formatCoinId(id: string): string {
    return id.charAt(0).toUpperCase() + id.slice(1).toLowerCase();
  }

  /**
   * Fetches current prices and 24h price change percentage for multiple coins in a given currency, ignoring cache.
   * @param coinIds Array of coin IDs to fetch prices for
   * @returns Observable emitting an object mapping coin IDs to their price data, including 24h change percentage
   */
  refreshCoinPrices(coinIds: string[]): Observable<Cached<CoinPricesResponse>> {
    this.clearCoinPriceCache();
    return this.getCoinPrices(coinIds);
  }

  /**
   * Clears the cache for the given coin and fetches fresh data.
   * @param coinId The coin identifier string
   * @returns Observable emitting fresh data for the given coin
   */
  refreshCoinData(coinId: string): Observable<Cached<Coin>> {
    const formattedId = this.formatCoinId(coinId);
    const key = `${this.STORAGE_KEY_COIN}${formattedId}`;
    localStorage.removeItem(key);
    return this.getCoinData(coinId);
  }

  /**
   * Clears all cached coin data from localStorage.
   */
  clearCoinCache(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.STORAGE_KEY_COIN))
      .forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Clears the cache for the current prices and 24h price change percentage data from localStorage.
   */
  clearCoinPriceCache(): void {
    localStorage.removeItem(this.STORAGE_KEY_COIN_PRICES);
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
