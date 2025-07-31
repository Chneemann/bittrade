import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthHeaderComponent } from './components/header/auth-header.component';
import { AuthFooterComponent } from './components/footer/auth-footer.component';
import { routeFadeAnimation } from '../shared/animations/route.animations';

@Component({
  selector: 'app-auth-wrapper',
  imports: [RouterOutlet, AuthHeaderComponent, AuthFooterComponent],
  templateUrl: './auth-wrapper.component.html',
  styleUrl: './auth-wrapper.component.scss',
  animations: [routeFadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthWrapperComponent {
  getAnimationState(outlet: RouterOutlet): string {
    return outlet && outlet.isActivated
      ? outlet.activatedRoute.routeConfig?.path ?? 'default'
      : 'default';
  }
}
