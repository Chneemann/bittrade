import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoinHolding } from '../../../models/coin.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CoinHoldingsService } from '../../../services/coin-holdings.service';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../../../../shared/components/buttons/icon-button/icon-button.component';

@Component({
  selector: 'app-coin-detail-holdings',
  imports: [CommonModule, IconButtonComponent],
  templateUrl: './coin-detail-holdings.component.html',
  styleUrl: './coin-detail-holdings.component.scss',
})
export class CoinDetailHoldingsComponent {
  @Input() coinPrice: number = 0;

  @Output() holdingChanged = new EventEmitter<CoinHolding | null>();

  selectedCoinId: string | null = null;
  holding: CoinHolding | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private coinHoldingsService: CoinHoldingsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.selectedCoinId = params.get('id');

      if (this.selectedCoinId) {
        this.loadHolding(this.selectedCoinId);
      }
    });
  }

  loadHolding(coinId: string): void {
    this.coinHoldingsService.getHoldingByCoin(coinId).subscribe({
      next: (data) => {
        this.holding = data;
        this.holdingChanged.emit(this.holding);
      },
      error: (err) => {
        console.error('Error loading the holding:', err);
        this.holding = null;
        this.holdingChanged.emit(null);
      },
    });
  }

  onClick(coinSlug: string): void {
    if (!coinSlug) return;
    this.router.navigate(['/home/transactions', coinSlug]);
  }
}
