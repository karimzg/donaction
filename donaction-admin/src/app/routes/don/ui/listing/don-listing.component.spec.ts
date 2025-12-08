import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonListingComponent } from './don-listing.component';

describe('DonationListingComponent', () => {
  let component: DonListingComponent;
  let fixture: ComponentFixture<DonListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
