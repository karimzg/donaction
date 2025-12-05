import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { hasTmplLibrairyGuard } from './has-tmpl-librairy.guard';

describe('hasTmplLibrairyGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => hasTmplLibrairyGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
