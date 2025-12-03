import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { klubHouseResolver } from './klub-house.resolver';

describe('klubHouseResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => klubHouseResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
