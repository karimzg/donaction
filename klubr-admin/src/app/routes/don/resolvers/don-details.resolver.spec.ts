import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { donationDetailsResolver } from './donation-details.resolver';

describe('donDetailsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => donationDetailsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
