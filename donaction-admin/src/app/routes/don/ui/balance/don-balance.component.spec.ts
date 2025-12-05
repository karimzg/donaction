import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonBalanceComponent } from './don-balance.component';

describe('DonBalanceComponent', () => {
  let component: DonBalanceComponent;
  let fixture: ComponentFixture<DonBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
