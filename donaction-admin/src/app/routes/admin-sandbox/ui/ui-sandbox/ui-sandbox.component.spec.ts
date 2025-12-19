import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiSandboxComponent } from './ui-sandbox.component';

describe('UiSandboxComponent', () => {
  let component: UiSandboxComponent;
  let fixture: ComponentFixture<UiSandboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSandboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiSandboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
