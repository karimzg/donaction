import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberFiltersComponent } from './member-filters.component';

describe('DonationsFiltersComponent', () => {
  let component: MemberFiltersComponent;
  let fixture: ComponentFixture<MemberFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberFiltersComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MemberFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
