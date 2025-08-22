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
  transactionType: 'deposit' | 'withdrawal';
  transactionSource: string;
  amount: number;
  createdAt: string;
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
