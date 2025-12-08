import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { initProjectResolver } from './init-project.resolver';

describe('initProjectResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => initProjectResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
