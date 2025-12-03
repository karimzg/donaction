import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnvalidateFrontComponent } from './unvalidate-front.component';

describe('UnvalidateFrontComponent', () => {
  let component: UnvalidateFrontComponent;
  let fixture: ComponentFixture<UnvalidateFrontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnvalidateFrontComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnvalidateFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
