import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberListingComponent } from './member-listing.component';

describe('ListingComponent', () => {
  let component: MemberListingComponent;
  let fixture: ComponentFixture<MemberListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
