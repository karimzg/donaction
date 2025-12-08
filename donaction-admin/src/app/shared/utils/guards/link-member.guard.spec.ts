import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { linkMemberGuard } from './link-member.guard';

describe('linkMemberGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => linkMemberGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
