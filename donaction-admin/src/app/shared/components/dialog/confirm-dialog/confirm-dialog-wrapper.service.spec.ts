import { TestBed } from '@angular/core/testing';

import { ConfirmDialogWrapperService } from './confirm-dialog-wrapper.service';

describe('ConfirmDialogWrapperService', () => {
  let service: ConfirmDialogWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmDialogWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
