import { Component } from '@angular/core';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-profile',
  imports: [PrimaryButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {}
