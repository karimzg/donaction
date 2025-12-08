import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlubStatusComponent } from './klub-status.component';

describe('KlubStatusComponent', () => {
  let component: KlubStatusComponent;
  let fixture: ComponentFixture<KlubStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlubStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KlubStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
