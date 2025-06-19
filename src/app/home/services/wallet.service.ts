import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import { Wallet } from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(private backendApi: BackendApiService) {}

  getWallet(): Observable<Wallet> {
    return this.backendApi.get<Wallet>('/api/me/wallet/');
  }

  changeWalletBalance(
    amount: number,
    operation: 'deposit' | 'withdraw'
  ): Observable<Wallet> {
    const endpoint = `/api/me/wallet/${operation}/`;
    return this.backendApi.post<Wallet, { amount: number }>(endpoint, {
      amount: amount,
    });
  }
}
