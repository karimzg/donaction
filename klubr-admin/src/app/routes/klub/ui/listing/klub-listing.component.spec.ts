import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlubListingComponent } from './klub-listing.component';

describe('ListingComponent', () => {
  let component: KlubListingComponent;
  let fixture: ComponentFixture<KlubListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlubListingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(KlubListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
