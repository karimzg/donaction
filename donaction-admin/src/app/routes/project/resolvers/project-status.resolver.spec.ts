import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { projectStatusResolver } from './project-status.resolver';

describe('projectStatusResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => projectStatusResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
