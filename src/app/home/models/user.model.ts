export interface UserProfile {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  coin_purchases: number;
  coin_sales: number;
  held_coins: number;
  wallet_deposits: number;
  wallet_withdrawals: number;
  wallet_balance: number;
}

export interface UserProfileUpdate {
  username?: string;
  email?: string;
  password?: string;
  verified?: boolean;
}

export enum UserProfileVerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
}
