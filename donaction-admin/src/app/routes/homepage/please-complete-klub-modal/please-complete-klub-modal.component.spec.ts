import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PleaseCompleteKlubModalComponent } from './please-complete-klub-modal.component';

describe('PleaseCompleteKlubModalComponent', () => {
  let component: PleaseCompleteKlubModalComponent;
  let fixture: ComponentFixture<PleaseCompleteKlubModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PleaseCompleteKlubModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PleaseCompleteKlubModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
