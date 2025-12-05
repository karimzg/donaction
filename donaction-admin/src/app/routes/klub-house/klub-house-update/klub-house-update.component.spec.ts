import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlubHouseUpdateComponent } from './klub-house-update.component';

describe('ModifyClubComponent', () => {
  let component: KlubHouseUpdateComponent;
  let fixture: ComponentFixture<KlubHouseUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlubHouseUpdateComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(KlubHouseUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
