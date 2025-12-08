import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentValidationModalComponent } from './document-validation-modal.component';

describe('DocumentValidationModalComponent', () => {
  let component: DocumentValidationModalComponent;
  let fixture: ComponentFixture<DocumentValidationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentValidationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentValidationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
