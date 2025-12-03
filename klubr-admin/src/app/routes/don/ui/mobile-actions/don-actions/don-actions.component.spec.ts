import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonActionsComponent } from './don-actions.component';

describe('DonActionsComponent', () => {
  let component: DonActionsComponent;
  let fixture: ComponentFixture<DonActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
