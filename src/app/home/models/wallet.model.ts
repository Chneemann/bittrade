export interface Wallet {
  id: string;
  balance: number;
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
