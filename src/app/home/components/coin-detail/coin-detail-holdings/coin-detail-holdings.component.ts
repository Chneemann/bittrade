import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoinHoldingsService } from '../../../services/coin-holdings.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coin-detail-holdings',
  imports: [CommonModule],
  templateUrl: './coin-detail-holdings.component.html',
  styleUrl: './coin-detail-holdings.component.scss',
})
export class CoinDetailHoldingsComponent {
  @Input() coinSlug: string = '';
  @Input() coinPrice: number = 0;

  selectedCoinSlug: string | null = null;
  holding!: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private coinHoldingsService: CoinHoldingsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.selectedCoinSlug = params.get('id');

      if (this.selectedCoinSlug) {
        this.loadHolding(this.selectedCoinSlug);
      }
    });
  }

  loadHolding(coinId: string): void {
    this.coinHoldingsService.getHoldingByCoin(coinId).subscribe((txs) => {
      this.holding = txs;
    });
  }

  onClick(coinSlug: string): void {
    if (!coinSlug) return;
    this.router.navigate(['/home/transactions', coinSlug]);
  }
}
