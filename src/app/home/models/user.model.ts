export interface UserProfile {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  coinPurchases: number;
  coinSales: number;
  heldCoins: number;
  walletFiatDeposits: number;
  walletFiatWithdrawals: number;
  walletTotalBalance: number;
}

export interface UserProfileUpdate {
  username?: string;
  email?: string;
  unconfirmed_email?: string;
  password?: string;
  verified?: boolean;
}

export enum UserProfileVerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
}
