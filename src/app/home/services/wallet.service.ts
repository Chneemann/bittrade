import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import {
  Wallet,
  WalletTransactionType,
  WalletTransactionSource,
  WalletUpdateResponse,
  WalletTransaction,
} from '../models/wallet.model';
import { mapApiToCamel, mapCamelToApi } from '../../core/utils/api-mapper';

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(private backendApi: BackendApiService) {}

  getWallet(): Observable<Wallet> {
    return this.backendApi.get<Wallet>('/api/me/wallet/');
  }

  getWalletTransactionsBySource(
    source: 'fiat' | 'coin'
  ): Observable<WalletTransaction[]> {
    return this.backendApi
      .get<WalletTransaction[]>(`/api/me/wallet/transactions/${source}/`)
      .pipe(
        map((transactions) =>
          transactions.map((tx) => mapApiToCamel<WalletTransaction>(tx))
        )
      );
  }

  changeWalletBalance(
    amount: number,
    transactionType: WalletTransactionType,
    transactionSource: WalletTransactionSource
  ): Observable<WalletUpdateResponse> {
    const endpoint = `/api/me/wallet/${transactionType}/`;
    const payload = mapCamelToApi({
      amount,
      transactionSource,
    });

    return this.backendApi
      .post<WalletUpdateResponse, any>(endpoint, payload)
      .pipe(map((res) => mapApiToCamel<WalletUpdateResponse>(res)));
  }
}
