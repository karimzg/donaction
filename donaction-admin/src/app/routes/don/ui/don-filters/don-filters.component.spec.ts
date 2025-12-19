import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonFiltersComponent } from './don-filters.component';

describe('DonationsFiltersComponent', () => {
  let component: DonFiltersComponent;
  let fixture: ComponentFixture<DonFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonFiltersComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DonFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
