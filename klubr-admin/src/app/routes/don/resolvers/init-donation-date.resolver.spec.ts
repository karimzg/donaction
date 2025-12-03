import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { initDonationDateResolver } from './init-donation-date.resolver';

describe('initProjectDateResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => initDonationDateResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
