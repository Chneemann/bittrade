import { Routes } from '@angular/router';
import { AuthWrapperComponent } from './components/auth/auth-wrapper.component';
import { LoginComponent } from './components/auth/login/login.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './pages/legal-notice/legal-notice.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthWrapperComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'login/privacy-policy', component: PrivacyPolicyComponent },
      { path: 'login/legal-notice', component: LegalNoticeComponent },

      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
