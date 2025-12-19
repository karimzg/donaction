import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

// TODO: remove (plus utilisé depuis la mise en place de la route link-member/:code)
export const invitationCodeGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const invitationCode = route.queryParamMap.get('invitationCode');
  if (invitationCode) {
    router.navigate(['/link-member'], { queryParams: { invitationCode } });
    return false;
  }
  return true;
};
