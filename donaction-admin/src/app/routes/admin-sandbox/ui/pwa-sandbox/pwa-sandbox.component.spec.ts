import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwaSandboxComponent } from './pwa-sandbox.component';

describe('PwaSandboxComponent', () => {
  let component: PwaSandboxComponent;
  let fixture: ComponentFixture<PwaSandboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PwaSandboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PwaSandboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
