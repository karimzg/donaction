import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { initDonationStatusResolver } from './init-donation-status.resolver';

describe('initStatusResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => initDonationStatusResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
