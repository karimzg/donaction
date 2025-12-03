import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownItemFilterComponent } from './dropdown-item-filter.component';

describe('UpdateKlubrComponent', () => {
  let component: DropdownItemFilterComponent;
  let fixture: ComponentFixture<DropdownItemFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownItemFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownItemFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
