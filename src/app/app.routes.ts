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
import { CoinTransactionsComponent } from './home/components/transactions/coin-transactions.component';
import { ProfileComponent } from './home/components/profile/profile.component';
import { PortfolioComponent } from './home/components/portfolio/portfolio.component';
import { DepositWithdrawComponent } from './home/components/portfolio/deposit-withdraw/deposit-withdraw.component';
import { BuySellComponent } from './home/components/coin-detail/buy-sell/buy-sell.component';
import { EditProfileComponent } from './home/components/profile/edit-profile/edit-profile.component';
import { EmailVerificationComponent } from './auth/components/email-verification/email-verification.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { PasswordResetRequestComponent } from './auth/components/password-reset/password-reset-request/password-reset-request.component';
import { PasswordResetConfirmComponent } from './auth/components/password-reset/password-reset-confirm/password-reset-confirm.component';
import { HistoryComponent } from './home/components/history/history.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'auth',
    component: AuthWrapperComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'logout', component: LogoutComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: PasswordResetRequestComponent },
      { path: 'reset-password', component: PasswordResetConfirmComponent },
      { path: 'login/privacy-policy', component: PrivacyPolicyComponent },
      { path: 'login/legal-notice', component: LegalNoticeComponent },
      { path: 'verify-email', component: EmailVerificationComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'legal-notice', component: LegalNoticeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/edit', component: EditProfileComponent },
      { path: 'portfolio', component: PortfolioComponent },
      { path: 'market', component: MarketComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'coin/:id', component: CoinDetailComponent },
      { path: 'coin/transactions', component: CoinTransactionsComponent },
      { path: 'coin/transactions/:id', component: CoinTransactionsComponent },
      { path: 'deposit', component: DepositWithdrawComponent },
      { path: 'withdraw', component: DepositWithdrawComponent },
      { path: 'buy/:id', component: BuySellComponent },
      { path: 'sell/:id', component: BuySellComponent },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
