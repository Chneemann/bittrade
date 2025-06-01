import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

interface ChartDataPoint {
  name: string | Date;
  value: number;
}

interface ChartSeries {
  name: string;
  series: ChartDataPoint[];
}

@Component({
  selector: 'app-simple-chart',
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './simple-chart.component.html',
  styleUrl: './simple-chart.component.scss',
})
export class SimpleChartComponent implements OnChanges {
  @Input() dynamicClass = 'coin-card-chart';
  @Input() chartData: { date: Date; price: number }[] = [];
  @Input() isPositiveTrend: boolean = true; // Used to determine line color

  chartSeries: ChartSeries[] = [];

  readonly chartOptions = {
    autoScale: true,
    showXAxis: false,
    showYAxis: false,
  };

  private readonly positiveColor = '#20bf73';
  private readonly negativeColor = '#d90429';

  colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [this.positiveColor],
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData']?.currentValue) {
      this.configureChart();
    }
  }

  private configureChart(): void {
    this.buildChartSeries();
    this.setColorByTrend();
    this.configureAxisVisibility();
  }

  configureAxisVisibility(): void {
    if (this.dynamicClass === 'coin-detail-chart') {
      this.chartOptions.showXAxis = true;
      this.chartOptions.showYAxis = true;
    }
  }

  private buildChartSeries(): void {
    if (!this.chartData?.length) {
      this.chartSeries = [];
      return;
    }

    this.chartSeries = [
      {
        name: 'Price',
        series: this.chartData.map((item) => ({
          name: item.date,
          value: item.price,
        })),
      },
    ];
  }

  private setColorByTrend(): void {
    const newColor = this.isPositiveTrend
      ? this.positiveColor
      : this.negativeColor;

    if (this.colorScheme.domain[0] !== newColor) {
      this.colorScheme = {
        ...this.colorScheme,
        domain: [newColor],
      };
    }
  }
}
