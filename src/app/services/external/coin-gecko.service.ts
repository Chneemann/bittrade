import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CoinGeckoApiService } from './coin-gecko-api.service';
import {
  Cached,
  Coin,
  CoinPricesResponse,
  MarketChartData,
} from '../../components/models/coin.model';
import { CoinGeckoCacheService } from './coin-gecko-cache.service';

@Injectable({
  providedIn: 'root',
})
export class CoinGeckoService {
  constructor(
    private apiService: CoinGeckoApiService,
    private cacheService: CoinGeckoCacheService
  ) {}

  /**
   * Formats a coin ID with uppercase first letter and lowercase rest.
   * @param id The coin ID string
   * @returns Formatted coin ID
   */
  private formatCoinId(id: string): string {
    return id.charAt(0).toUpperCase() + id.slice(1).toLowerCase();
  }

  /**
   * Fetches detailed coin data by coin ID.
   * Returns cached data if available and fresh.
   * @param coinId The coin identifier string
   * @returns Observable emitting Cached<Coin>
   */
  getCoinData(coinId: string): Observable<Cached<Coin>> {
    const formattedId = this.formatCoinId(coinId);
    const key = `${this.cacheService.coinStorageKey}${formattedId}`;
    const cached = this.cacheService.getCachedData<Coin>(key);

    if (cached) {
      return of({ data: cached.data, timestamp: cached.timestamp });
    } else {
      return this.apiService.getApiCoinData(coinId).pipe(
        tap((data) => this.cacheService.setCache(key, data)),
        map((data) => ({ data, timestamp: Date.now() }))
      );
    }
  }

  /**
   * Fetches current prices and 24h price change percentage for multiple coins.
   * Returns cached data if available and fresh.
   * @param coinIds Array of coin IDs to fetch prices for
   * @returns Observable emitting Cached<CoinPricesResponse>
   */
  getCoinPrices(coinIds: string[]): Observable<Cached<CoinPricesResponse>> {
    const cached = this.cacheService.getCachedData<CoinPricesResponse>(
      this.cacheService.coinPricesStorageKey
    );

    if (cached) {
      return of({ data: cached.data, timestamp: cached.timestamp });
    } else {
      return this.apiService.getApiCoinPrices(coinIds).pipe(
        tap((data) =>
          this.cacheService.setCache(
            this.cacheService.coinPricesStorageKey,
            data
          )
        ),
        map((data) => ({ data, timestamp: Date.now() }))
      );
    }
  }

  /**
   * Fetches market chart data for a given coin and time range.
   * Returns cached data if available and fresh.
   * @param coinId The coin identifier string
   * @param days The time range for the chart data
   * @returns Observable emitting Cached<MarketChartData>
   */
  getMarketChartData(
    coinId: string,
    days: string
  ): Observable<Cached<MarketChartData>> {
    const formattedId = this.formatCoinId(coinId);
    const cacheKey = `${formattedId}${days}`;

    const cache = this.cacheService.getMarketChartCache();

    const cachedEntry = cache[cacheKey];
    if (
      cachedEntry &&
      Date.now() - cachedEntry.timestamp < this.cacheService.defaultTtlMs
    ) {
      return of(cachedEntry);
    } else {
      return this.apiService.getApiMarketChartData(coinId, days).pipe(
        tap((data) => {
          const updatedCache = this.cacheService.getMarketChartCache();
          updatedCache[cacheKey] = { data, timestamp: Date.now() };
          this.cacheService.setMarketChartCache(updatedCache);
        }),
        map((data) => ({ data, timestamp: Date.now() }))
      );
    }
  }

  /**
   * Fetches current prices and 24h price change percentage for multiple coins, ignoring cache.
   * Clears relevant caches and then fetches fresh data.
   * @param coinIds Array of coin IDs to fetch prices for
   * @returns Observable emitting Cached<CoinPricesResponse>
   */
  refreshCoinPricesAndMarketCharts(
    coinIds: string[]
  ): Observable<Cached<CoinPricesResponse>> {
    this.cacheService.clearCoinPriceCache();
    this.cacheService.clearMarketChartDataCache();
    return this.getCoinPrices(coinIds);
  }

  /**
   * Clears the cache for the given coin and fetches fresh data.
   * @param coinId The coin identifier string
   * @returns Observable emitting fresh data for the given coin
   */
  refreshCoinData(coinId: string): Observable<Cached<Coin>> {
    const formattedId = this.formatCoinId(coinId);
    const key = `${this.cacheService.coinStorageKey}${formattedId}`;
    this.cacheService.clearCache(key);
    return this.getCoinData(coinId);
  }

  /**
   * Clears the cache for market chart data for a specific coin and time range.
   * @param coinId The coin identifier string
   * @param days The time range for the chart data (e.g. '1', '7', '14', '30', '90', '180', '365', 'max')
   */
  clearMarketChartCacheForCoin(coinId: string, days: string): void {
    const formattedId = this.formatCoinId(coinId);
    const cacheKey = `${formattedId}${days}`;
    const cache = this.cacheService.getMarketChartCache();
    delete cache[cacheKey];
    this.cacheService.setMarketChartCache(cache);
  }

  /**
   * Clears the cache for market chart data for a specific coin and time range,
   * then fetches fresh data.
   * @param coinId The coin identifier string
   * @param days The time range for the chart data (e.g. '1', '7', '14', '30', '90', '180', '365', 'max')
   * @returns Observable emitting fresh market chart data for the given coin and time range
   */
  refreshMarketChartDataForCoin(
    coinId: string,
    days: string
  ): Observable<Cached<MarketChartData>> {
    this.clearMarketChartCacheForCoin(coinId, days);
    return this.getMarketChartData(coinId, days);
  }
}
