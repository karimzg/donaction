import { TestBed } from '@angular/core/testing';

import { KlubrService } from './klubr.service';

describe('KlubrService', () => {
  let service: KlubrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KlubrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
