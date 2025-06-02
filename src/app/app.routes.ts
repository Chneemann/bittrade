import { Routes } from '@angular/router';
import { AuthWrapperComponent } from './auth/auth-wrapper.component';
import { LoginComponent } from './auth/components/login/login.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './pages/legal-notice/legal-notice.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { LogoutComponent } from './auth/components/logout/logout.component';
import { MarketComponent } from './home/components/market/market.component';
import { CoinDetailComponent } from './home/components/coin-detail/coin-detail.component';
import { TransactionsComponent } from './home/components/transactions/transactions.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'auth',
    component: AuthWrapperComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'logout', component: LogoutComponent },
      { path: 'login/privacy-policy', component: PrivacyPolicyComponent },
      { path: 'login/legal-notice', component: LegalNoticeComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'market', component: MarketComponent },
      { path: 'coin/:id', component: CoinDetailComponent },
      { path: 'transactions/:id', component: TransactionsComponent },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
