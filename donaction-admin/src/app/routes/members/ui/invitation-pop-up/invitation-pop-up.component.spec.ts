import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationPopUpComponent } from './invitation-pop-up.component';

describe('InvitationPopUpComponent', () => {
  let component: InvitationPopUpComponent;
  let fixture: ComponentFixture<InvitationPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationPopUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvitationPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
