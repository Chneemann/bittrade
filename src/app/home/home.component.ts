import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../shared/components/navigation/navigation.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { HeaderComponent } from '../shared/components/header/header.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterOutlet,
    NavigationComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
