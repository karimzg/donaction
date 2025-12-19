import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceDonLineComponent } from './balance-don-line.component';

describe('BalanceDonLineComponent', () => {
  let component: BalanceDonLineComponent;
  let fixture: ComponentFixture<BalanceDonLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceDonLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceDonLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
