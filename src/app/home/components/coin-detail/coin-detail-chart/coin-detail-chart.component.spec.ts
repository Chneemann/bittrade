import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinDetailChartComponent } from './coin-detail-chart.component';

describe('CoinDetailChartComponent', () => {
  let component: CoinDetailChartComponent;
  let fixture: ComponentFixture<CoinDetailChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoinDetailChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoinDetailChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
