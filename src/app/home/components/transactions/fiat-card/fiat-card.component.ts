import { Component, Input } from '@angular/core';
import { FiatTransaction } from '../../../models/wallet.model';

@Component({
  selector: 'app-fiat-card',
  imports: [],
  templateUrl: './fiat-card.component.html',
  styleUrl: './fiat-card.component.scss',
})
export class FiatCardComponent {
  @Input() transaction: FiatTransaction | null = null;
}
