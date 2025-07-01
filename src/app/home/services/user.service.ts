import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  coin_purchases: number;
  coin_sales: number;
  held_coins: number;
  wallet_deposits: number;
  wallet_withdrawals: number;
  wallet_balance: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private backendApi: BackendApiService) {}

  getProfile(): Observable<UserProfile> {
    return this.backendApi.get<UserProfile>('/auth/me/');
  }
}
