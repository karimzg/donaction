import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { combineLatest, filter, map } from 'rxjs';
import { AuthFacade } from '@app/routes/auth/data-access/+state/auth.facade';

export const linkMemberGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return combineLatest([authFacade.isAuthenticated$, authFacade.me$]).pipe(
    // tap(([isAuthenticated, me]) => console.log('%c2-GUARD tap', 'color: orange', isAuthenticated, me)),
    filter(([isAuthenticated, me]) => isAuthenticated !== undefined && me !== undefined),
    map(([isAuthenticated, me]) => {
      if (me && (!me.klubr_membres || me.klubr_membres.length === 0)) {
        // If user doesn't have klubr members, allow access to link-member
        return true;
      }
      // If user has klubr members and tries to access link-member, redirect to '/'
      if (state.url.includes('link-member')) {
        return router.createUrlTree(['/']);
      }
      // Allow access to other routes
      return true;
    })
  );
};
