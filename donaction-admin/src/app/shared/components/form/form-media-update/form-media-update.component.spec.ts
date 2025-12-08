import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMediaUpdateComponent } from './form-media-update.component';

describe('MediaUpdateComponent', () => {
  let component: FormMediaUpdateComponent;
  let fixture: ComponentFixture<FormMediaUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormMediaUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormMediaUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
