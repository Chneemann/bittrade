import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinDetailHoldingsComponent } from './coin-detail-holdings.component';

describe('CoinDetailHoldingsComponent', () => {
  let component: CoinDetailHoldingsComponent;
  let fixture: ComponentFixture<CoinDetailHoldingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoinDetailHoldingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoinDetailHoldingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
