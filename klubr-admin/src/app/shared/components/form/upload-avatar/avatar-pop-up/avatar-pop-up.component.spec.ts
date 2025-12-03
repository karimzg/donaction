import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarPopUpComponent } from './avatar-pop-up.component';

describe('AvatarPopUpComponent', () => {
  let component: AvatarPopUpComponent;
  let fixture: ComponentFixture<AvatarPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarPopUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AvatarPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
