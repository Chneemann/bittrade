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

function snakeToCamel(s: string): string {
  return s.replace(/(_\w)/g, (m) => m[1].toUpperCase());
}

export function mapApiToCamel<T>(apiData: any): T {
  const result: any = {};
  for (const key in apiData) {
    if (apiData.hasOwnProperty(key)) {
      result[snakeToCamel(key)] = apiData[key];
    }
  }
  return result;
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
