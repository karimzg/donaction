import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFiltersComponent } from './generic-filters.component';

describe('GenericFiltersComponent', () => {
  let component: GenericFiltersComponent;
  let fixture: ComponentFixture<GenericFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
