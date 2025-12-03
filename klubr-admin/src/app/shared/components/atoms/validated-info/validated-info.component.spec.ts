import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatedInfoComponent } from './validated-info.component';

describe('ValidatedInfoComponent', () => {
  let component: ValidatedInfoComponent;
  let fixture: ComponentFixture<ValidatedInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidatedInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidatedInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
