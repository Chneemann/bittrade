import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketHeaderComponent } from './market-header.component';

describe('MarketHeaderComponent', () => {
  let component: MarketHeaderComponent;
  let fixture: ComponentFixture<MarketHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
