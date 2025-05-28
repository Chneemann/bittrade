import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../shared/components/navigation/navigation.component';
import { FooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, NavigationComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
