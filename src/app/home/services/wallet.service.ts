import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import {
  Wallet,
  WalletTransactionType,
  WalletTransactionSource,
} from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(private backendApi: BackendApiService) {}

  getWallet(): Observable<Wallet> {
    return this.backendApi.get<Wallet>('/api/me/wallet/');
  }

  changeWalletBalance(
    amount: number,
    transactionType:
      | WalletTransactionType.DEPOSIT
      | WalletTransactionType.WITHDRAW,
    transactionSource:
      | WalletTransactionSource.FIAT
      | WalletTransactionSource.COIN
  ): Observable<Wallet> {
    const endpoint = `/api/me/wallet/${transactionType}/`;
    return this.backendApi.post<
      Wallet,
      { amount: number; transaction_source: string }
    >(endpoint, {
      amount: amount,
      transaction_source: transactionSource,
    });
  }
}
