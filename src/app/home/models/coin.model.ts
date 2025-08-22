export interface Coin {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly web_slug: string;
  readonly description: {
    readonly en: string;
    readonly [key: string]: string;
  };
  readonly market_data: {
    readonly price_change_percentage_24h: number;
    readonly price_change_24h_in_currency: {
      readonly [currency: string]: number;
    };
    readonly current_price: {
      readonly [currency: string]: number;
    };
    readonly ath: {
      readonly [currency: string]: number;
    };
  };
  readonly last_updated: string;
}

export interface Cached<T> {
  readonly data: T;
  readonly timestamp: number;
}

export interface CoinPrice {
  readonly usd: number;
  readonly usd_24h_change: number;
}

export interface CoinPricesResponse {
  readonly [coinId: string]: CoinPrice;
}

export type CoinList = {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
};

export type CoinListResponse = CoinList[];

export interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface MarketChartCache {
  [key: string]: Cached<MarketChartData>;
}

// Backend (Django) API responses

export interface BaseCoin {
  name: string;
  symbol: string;
  slug: string;
}

export interface CoinTransactionCreateDto {
  transactionType: 'buy' | 'sell';
  amount: number;
  pricePerCoin: number;
}

export interface CoinTransaction extends CoinTransactionCreateDto {
  id: string;
  coin: BaseCoin;
  createdAt: string;
}

export interface CoinHolding {
  id: string;
  coin: BaseCoin;
  amount: number;
  averageBuyPrice: number;
  notHolding: boolean;
}
