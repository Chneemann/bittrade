import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';

export interface Wallet {
  id: string;
  balance: number;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(private backendApi: BackendApiService) {}

  getWallet(): Observable<Wallet> {
    return this.backendApi.get<Wallet>('/api/me/wallet/');
  }
}
