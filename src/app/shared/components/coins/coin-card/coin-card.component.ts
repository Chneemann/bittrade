import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CoinGeckoService } from '../../../../core/services/external/coin-gecko.service';
import { SimpleChartComponent } from '../../charts/simple-chart/simple-chart.component';

export interface CoinData {
  name: string;
  symbol: string;
  price: number;
  change: number;
}

@Component({
  selector: 'app-coin-card',
  imports: [CommonModule, SimpleChartComponent],
  templateUrl: './coin-card.component.html',
  styleUrl: './coin-card.component.scss',
})
export class CoinCardComponent {
  @Input() coin!: CoinData;

  selectedTime: string = '1'; // Time in days
  chartData: { date: Date; price: number }[] = [];

  constructor(private coinGeckoService: CoinGeckoService) {}

  ngOnInit(): void {
    this.loadMarketChart(this.coin.name.toLowerCase(), this.selectedTime);
  }

  loadMarketChart(coinId: string, days: string): void {
    this.coinGeckoService.getMarketChartData(coinId, days).subscribe({
      next: (response) => {
        this.chartData = response.data.prices.map((item) => ({
          date: new Date(item[0]),
          price: item[1],
        }));
      },
      error: (err) => {
        console.error('Error loading the chart data:', err);
      },
    });
  }
}
