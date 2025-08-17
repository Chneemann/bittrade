export interface Wallet {
  id: string;
  balance: number;
}

export interface WalletUpdateResponse {
  balance: number;
  amount: number;
  type: string;
}

export interface WalletTransaction {
  id: string;
  transaction_type: 'deposit' | 'withdrawal';
  transaction_source: string;
  amount: number;
  created_at: string;
}

export enum WalletTransactionType {
  WITHDRAW = 'withdraw',
  DEPOSIT = 'deposit',
}

export enum CoinTransactionType {
  BUY = 'buy',
  SELL = 'sell',
}

export enum WalletTransactionSource {
  COIN = 'coin',
  FIAT = 'fiat',
}
