import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { initMemberAccountResolver } from './init-member-account.resolver';

describe('initMemberAccountResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => initMemberAccountResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
