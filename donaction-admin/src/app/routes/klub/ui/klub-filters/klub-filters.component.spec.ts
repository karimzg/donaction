import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlubFiltersComponent } from './klub-filters.component';

describe('KlubFiltersComponent', () => {
  let component: KlubFiltersComponent;
  let fixture: ComponentFixture<KlubFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlubFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KlubFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
