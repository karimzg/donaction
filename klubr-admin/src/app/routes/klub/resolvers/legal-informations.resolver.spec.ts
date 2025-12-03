import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { legalInformationsResolver } from './legal-informations.resolver';

describe('legalInformationsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => legalInformationsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
