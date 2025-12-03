import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlubHouseDetailComponent } from './klub-house-detail.component';

describe('KlubDetailComponent', () => {
  let component: KlubHouseDetailComponent;
  let fixture: ComponentFixture<KlubHouseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlubHouseDetailComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(KlubHouseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
