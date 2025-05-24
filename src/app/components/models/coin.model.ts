export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  web_slug: string;
  description: {
    en: string;
    [key: string]: string;
  };
  market_data: {
    current_price: {
      [currency: string]: number;
    };
    ath: {
      [currency: string]: number;
    };
  };
  last_updated: string;
}
