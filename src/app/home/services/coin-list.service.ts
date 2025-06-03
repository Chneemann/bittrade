import { Injectable } from '@angular/core';
import { BackendApiService } from '../../core/services/backend-api.service';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cached, CoinListResponse } from '../models/coin.model';
import { CoinGeckoCacheService } from '../../core/services/external/coin-gecko-cache.service';

@Injectable({ providedIn: 'root' })
export class CoinListService {
  // Cache lifetime in milliseconds (24h)
  private readonly TTL_MS = 60 * 60 * 1000;
  private readonly STORAGE_KEY_COIN_LIST = 'cachedCoinList';

  constructor(
    private backendApiService: BackendApiService,
    private coinGeckoCacheService: CoinGeckoCacheService
  ) {}

  /**
   * Returns the cached coin list if valid, otherwise fetches from backend API and updates cache.
   * @returns Observable emitting the current list of coins
   */
  getCoinList(): Observable<CoinListResponse> {
    const cachedItem = this.getCachedItem();

    if (cachedItem && this.isCacheValid(cachedItem.timestamp)) {
      return of(cachedItem.data);
    }

    return this.fetchCoinsAndUpdateCache(cachedItem?.data);
  }

  /**
   * Retrieves the cached coin list from localStorage.
   * @returns Cached coin list or null if no valid cache exists
   */
  private getCachedItem(): Cached<CoinListResponse> | null {
    const json = localStorage.getItem(this.STORAGE_KEY_COIN_LIST);
    if (!json) return null;

    try {
      return JSON.parse(json);
    } catch {
      this.clearCache();
      return null;
    }
  }

  /**
   * Checks if the cached data timestamp is still valid based on TTL.
   * @param timestamp Timestamp of cached data
   * @returns True if cache is still valid, false otherwise
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.TTL_MS;
  }

  /**
   * Fetches the coin list from backend API and updates the cache.
   * Clears CoinGecko price cache if the coin list data changed.
   * @param oldData Optional previously cached coin list to compare changes
   * @returns Observable emitting fresh coin list data
   */
  private fetchCoinsAndUpdateCache(
    oldData?: CoinListResponse
  ): Observable<CoinListResponse> {
    return this.backendApiService.get<CoinListResponse>('/api/coins/').pipe(
      tap((freshData) => {
        const dataChanged = !this.isDataEqual(oldData, freshData);
        this.setCache(freshData);
        if (dataChanged) {
          this.coinGeckoCacheService.clearCoinPriceCache();
        }
      })
    );
  }

  /**
   * Stores coin list data in localStorage along with current timestamp.
   * @param data Coin list data to cache
   */
  private setCache(data: CoinListResponse): void {
    const cacheItem: Cached<CoinListResponse> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.STORAGE_KEY_COIN_LIST, JSON.stringify(cacheItem));
  }

  /**
   * Clears cached coin list and fetches fresh list from backend.
   * @returns Observable emitting the refreshed coin list
   */
  refreshCoinList(): Observable<CoinListResponse> {
    this.clearCache();
    return this.getCoinList();
  }

  /**
   * Removes the cached coin list from localStorage.
   */
  clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY_COIN_LIST);
  }

  /**
   * Compares two coin lists for equality by JSON stringification.
   * @param a First coin list
   * @param b Second coin list
   * @returns True if both lists are equal, false otherwise
   */
  private isDataEqual(a?: CoinListResponse, b?: CoinListResponse): boolean {
    if (!a || !b) return false;
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
