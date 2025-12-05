import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { invitationCodeGuard } from './invitation-code.guard';

describe('invitationCodeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => invitationCodeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
