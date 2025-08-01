import { Component, Input } from '@angular/core';
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-auth-success-modal',
  imports: [PrimaryButtonComponent],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.scss',
})
export class SuccessModalComponent {
  @Input() title: string = '';
  @Input() message: string = '';
}
