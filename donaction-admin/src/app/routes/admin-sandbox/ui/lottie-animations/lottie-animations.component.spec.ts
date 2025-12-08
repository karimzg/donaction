import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LottieAnimationsComponent } from './lottie-animations.component';

describe('LottieAnimationsComponent', () => {
  let component: LottieAnimationsComponent;
  let fixture: ComponentFixture<LottieAnimationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LottieAnimationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LottieAnimationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
