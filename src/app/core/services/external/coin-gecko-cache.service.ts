import { Injectable } from '@angular/core';
import { Cached, MarketChartCache } from '../../../home/models/coin.model'; // Assuming your models are here

import { CoinGeckoService } from './coin-gecko.service';

@Injectable({
  providedIn: 'root',
})
export class CoinGeckoCacheService {
  private readonly DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

  private readonly STORAGE_KEY_COIN = 'cachedCoin';
  private readonly STORAGE_KEY_COIN_PRICES = 'cachedCoinPrices';
  private readonly STORAGE_KEY_COIN_MARKET_CHART = 'cachedCoinMarketChart';

  /**
   * Attempts to retrieve cached data from localStorage.
   * Returns null if no cache exists or cache is expired or invalid.
   * @param key Cache key string
   * @returns Cached data of type T or null
   */
  getCachedData<T>(key: string): Cached<T> | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const cacheItem: Cached<T> = JSON.parse(raw);
      if (Date.now() - cacheItem.timestamp < this.DEFAULT_TTL_MS) {
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
  setCache<T>(key: string, data: T): void {
    const item: Cached<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Retrieves the cached market chart data from localStorage.
   * Returns an empty object if cache does not exist, is expired or invalid.
   * The TTL for market chart entries is managed internally within the cache object itself.
   * @returns Cached market chart data object or empty object
   */
  getMarketChartCache(): MarketChartCache {
    const raw = localStorage.getItem(this.STORAGE_KEY_COIN_MARKET_CHART);
    if (!raw) return {};
    try {
      const cache: MarketChartCache = JSON.parse(raw);
      for (const key in cache) {
        if (Object.prototype.hasOwnProperty.call(cache, key)) {
          if (Date.now() - cache[key].timestamp >= this.DEFAULT_TTL_MS) {
            delete cache[key];
          }
        }
      }
      return cache;
    } catch {
      localStorage.removeItem(this.STORAGE_KEY_COIN_MARKET_CHART);
      return {};
    }
  }

  /**
   * Stores the market chart data cache in localStorage.
   * @param cache Cache object with market chart data
   */
  setMarketChartCache(cache: MarketChartCache): void {
    localStorage.setItem(
      this.STORAGE_KEY_COIN_MARKET_CHART,
      JSON.stringify(cache)
    );
  }

  clearCoinMarketChartCache(coinId: string): void {
    const normalizedId = coinId.toLowerCase();
    const cache = this.getMarketChartCache();

    Object.keys(cache).forEach((key) => {
      if (key.startsWith(normalizedId)) {
        delete cache[key];
      }
    });

    this.setMarketChartCache(cache);
  }

  /**
   * Clears the cache for a specific key.
   * @param key The cache key to clear.
   */
  clearCache(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clears all cached coin data from localStorage based on common prefix.
   */
  clearAllCoinDataCache(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.STORAGE_KEY_COIN))
      .forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Clears the cache for coin prices.
   */
  clearCoinPriceCache(): void {
    localStorage.removeItem(this.STORAGE_KEY_COIN_PRICES);
  }

  /**
   * Clears all cached market chart data.
   */
  clearMarketChartDataCache(): void {
    localStorage.removeItem(this.STORAGE_KEY_COIN_MARKET_CHART);
  }

  // Expose storage and TTL keys for use in CoinGeckoService
  get defaultTtlMs(): number {
    return this.DEFAULT_TTL_MS;
  }

  get coinStorageKey(): string {
    return this.STORAGE_KEY_COIN;
  }

  get coinPricesStorageKey(): string {
    return this.STORAGE_KEY_COIN_PRICES;
  }

  get coinMarketChartStorageKey(): string {
    return this.STORAGE_KEY_COIN_MARKET_CHART;
  }
}
