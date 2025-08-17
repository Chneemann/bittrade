import { Component, Input } from '@angular/core';
import { WalletTransaction } from '../../../models/wallet.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fiat-card',
  imports: [CommonModule],
  templateUrl: './fiat-card.component.html',
  styleUrl: './fiat-card.component.scss',
})
export class FiatCardComponent {
  @Input() transaction: WalletTransaction | null = null;
}
