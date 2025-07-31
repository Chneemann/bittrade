import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../shared/components/navigation/navigation.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { HeaderComponent } from '../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { routeFadeAnimation } from '../shared/animations/route.animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    CommonModule,
    RouterOutlet,
    NavigationComponent,
    HeaderComponent,
    FooterComponent,
  ],
  animations: [routeFadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  getAnimationState(outlet: RouterOutlet): string {
    return outlet && outlet.isActivated
      ? outlet.activatedRoute.routeConfig?.path ?? 'default'
      : 'default';
  }
}
