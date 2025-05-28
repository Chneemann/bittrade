import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthHeaderComponent } from './components/header/auth-header.component';
import { AuthFooterComponent } from './components/footer/auth-footer.component';

@Component({
  selector: 'app-auth-wrapper',
  imports: [RouterOutlet, AuthHeaderComponent, AuthFooterComponent],
  templateUrl: './auth-wrapper.component.html',
  styleUrl: './auth-wrapper.component.scss',
})
export class AuthWrapperComponent {}
