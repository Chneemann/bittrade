import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiatCardComponent } from './fiat-card.component';

describe('FiatCardComponent', () => {
  let component: FiatCardComponent;
  let fixture: ComponentFixture<FiatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiatCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
