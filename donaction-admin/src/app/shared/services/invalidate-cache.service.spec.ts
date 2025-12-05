import { TestBed } from '@angular/core/testing';

import { InvalidateCacheService } from './invalidate-cache.service';

describe('InvalidateCacheService', () => {
  let service: InvalidateCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvalidateCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
