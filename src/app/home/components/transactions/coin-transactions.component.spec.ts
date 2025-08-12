import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinTransactionsComponent } from './coin-transactions.component';

describe('CoinTransactionsComponent', () => {
  let component: CoinTransactionsComponent;
  let fixture: ComponentFixture<CoinTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoinTransactionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoinTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
