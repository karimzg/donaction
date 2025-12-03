import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { initKlubResolver } from './init-klub.resolver';

describe('initKlubResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => initKlubResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
