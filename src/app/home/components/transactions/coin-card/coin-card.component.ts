import { Component, Input } from '@angular/core';
import { CoinTransaction } from '../../../models/coin.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coin-card',
  imports: [CommonModule],
  templateUrl: './coin-card.component.html',
  styleUrl: './coin-card.component.scss',
})
export class CoinCardComponent {
  @Input() transaction: CoinTransaction | null = null;
}
