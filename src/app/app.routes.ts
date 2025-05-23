import { Routes } from '@angular/router';
import { AuthWrapperComponent } from './components/auth/auth-wrapper.component';
import { LoginComponent } from './components/auth/login/login.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './pages/legal-notice/legal-notice.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { LogoutComponent } from './components/auth/logout/logout.component';

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
  },

  { path: '**', redirectTo: 'home' },
];
