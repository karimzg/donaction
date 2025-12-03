import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendByMailInvoiceComponent } from './send-by-mail-invoice.component';

describe('SendByMailInvoiceComponent', () => {
  let component: SendByMailInvoiceComponent;
  let fixture: ComponentFixture<SendByMailInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendByMailInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendByMailInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
