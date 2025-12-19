import { TestBed } from '@angular/core/testing';

import { MainMessageService } from './main-message.service';

describe('MainMessageService', () => {
  let service: MainMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
