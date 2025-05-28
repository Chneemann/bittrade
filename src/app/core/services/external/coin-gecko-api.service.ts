import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Coin,
  CoinPricesResponse,
  MarketChartData,
} from '../../../home/models/coin.model';

@Injectable({
  providedIn: 'root',
})
export class CoinGeckoApiService {
  private readonly baseUrl = environment.coinGeckoApiUrl;
  private readonly apiKey = environment.coinGeckoApiKey;

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
   * Fetches detailed coin data by coin ID from the CoinGecko API.
   * @param coinId The coin identifier string
   * @returns Observable emitting CoinData
   */
  getApiCoinData(coinId: string): Observable<Coin> {
    const params = this.buildHttpParams({});
    return this.http
      .get<Coin>(`${this.baseUrl}/coins/${coinId}`, { params })
      .pipe(shareReplay(1), catchError(this.handleError));
  }

  /**
   * Fetches current prices and 24h price change percentage for multiple coins
   * in a given currency from the CoinGecko API.
   * @param coinIds Array of coin IDs to fetch prices for
   * @returns Observable emitting an object mapping coin IDs to their price data, including 24h change percentage
   */
  getApiCoinPrices(coinIds: string[]): Observable<CoinPricesResponse> {
    const params = this.buildHttpParams({
      ids: coinIds.join(','),
      vs_currencies: 'usd',
      include_24hr_change: 'true',
    });
    return this.http
      .get<CoinPricesResponse>(`${this.baseUrl}/simple/price`, { params })
      .pipe(shareReplay(1), catchError(this.handleError));
  }

  /**
   * Fetches market chart data for a given coin and time range from the CoinGecko API.
   * @param coinId The coin identifier string
   * @param days The time range for the chart data (e.g. '1', '7', '14', '30', '90', '180', '365', 'max')
   * @returns Observable emitting the market chart data
   */
  getApiMarketChartData(
    coinId: string,
    days: string
  ): Observable<MarketChartData> {
    const params = this.buildHttpParams({
      vs_currency: 'usd',
      days: days,
    });
    return this.http
      .get<MarketChartData>(`${this.baseUrl}/coins/${coinId}/market_chart`, {
        params,
      })
      .pipe(shareReplay(1), catchError(this.handleError));
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
