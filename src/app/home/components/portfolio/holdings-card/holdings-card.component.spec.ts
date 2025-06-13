import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingsCardComponent } from './holdings-card.component';

describe('HoldingsCardComponent', () => {
  let component: HoldingsCardComponent;
  let fixture: ComponentFixture<HoldingsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldingsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoldingsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
