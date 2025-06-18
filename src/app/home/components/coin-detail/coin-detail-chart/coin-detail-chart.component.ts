import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SimpleChartComponent } from '../../../../shared/components/charts/simple-chart/simple-chart.component';
import { OptionButtonComponent } from '../../../../shared/components/buttons/option-button/option-button.component';

@Component({
  selector: 'app-coin-detail-chart',
  standalone: true,
  imports: [CommonModule, SimpleChartComponent, OptionButtonComponent],
  templateUrl: './coin-detail-chart.component.html',
  styleUrls: ['./coin-detail-chart.component.scss'],
})
export class CoinDetailChartComponent {
  @Input() chartData: { date: Date; price: number }[] = [];
  @Input() isPositiveTrend: boolean = false;
  @Input() selectedTime: string = '1';
  @Output() intervalChange = new EventEmitter<string>();

  intervals = [
    { value: '1', label: '24 Hours', mobileLabel: '24 H' },
    { value: '7', label: '7 Days', mobileLabel: '7 D' },
    { value: '30', label: '1 Month', mobileLabel: '1 M' },
    { value: '180', label: '6 Months', mobileLabel: '6 M' },
    { value: '365', label: '1 Year', mobileLabel: '1 Y' },
  ];

  onIntervalChange(interval: string): void {
    this.intervalChange.emit(interval);
  }
}
