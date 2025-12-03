import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateKlubrComponent } from './update-klubr.component';

describe('UpdateKlubrComponent', () => {
  let component: UpdateKlubrComponent;
  let fixture: ComponentFixture<UpdateKlubrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateKlubrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateKlubrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
