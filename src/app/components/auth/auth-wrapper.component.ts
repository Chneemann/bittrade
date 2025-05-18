import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthFooterComponent } from './footer/auth-footer.component';

@Component({
  selector: 'app-auth-wrapper',
  imports: [RouterOutlet, AuthFooterComponent],
  templateUrl: './auth-wrapper.component.html',
  styleUrl: './auth-wrapper.component.scss',
})
export class AuthWrapperComponent {}
