import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { map } from "rxjs/operators";
import { combineLatest, filter } from "rxjs";
import { AuthFacade } from '@app/routes/auth/data-access/+state/auth.facade';
import { environment } from "@environments/environment";

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  // console.log('%c1-GUARD', 'color: orange');
  // console.log('%c1-GUARD', 'color: orange', router.url, router, state, state.url, route, route.data, route.queryParams);

  return combineLatest([authFacade.isAuthenticated$, authFacade.me$]).pipe(
    // tap(([isAuthenticated, me]) => console.log('%c2-GUARD tap', 'color: orange', isAuthenticated, me)),
    filter(([isAuthenticated, me]) => isAuthenticated !== undefined && me !== undefined),
    map(([isAuthenticated, me]) => {
      // console.log('%c3-GUARD ME', 'color: orange', isAuthenticated, me, me && !me?.klubr_membres,(me && (!me?.klubr_membres || me?.klubr_membres.length === 0)));
      if (me && (!me?.klubr_membres || me?.klubr_membres.length === 0)) {
        if (!state.url.startsWith('/link-member')) {
          router.navigate(['/link-member']); // Redirect to link-member if klubr-members are not present
        }
      }

      if (!!me && !!isAuthenticated) {
        return true;
      }

      let message: string = '';
      switch (true) {
        case state.url === '/':
          message =
            'Connectez vous ou créez votre compte pour accéder votre espace Klub.';
          break;
        case state.url.startsWith('/profile'):
          message =
            'Connectez vous ou créez votre compte pour accéder votre espace Klub et gérer votre profile.';
          break;
        case state.url.startsWith('/project'):
          message =
            'Connectez vous ou créez votre compte pour accéder votre espace Klub et gérer vos projets.';
          break;
        case state.url.startsWith('/members'):
          message =
            'Connectez vous ou créez votre compte pour accéder votre espace Klub et gérer les membres de votre association.';
          break;
        case state.url.startsWith('/don'):
          message =
            'Connectez vous ou créez votre compte pour accéder votre espace Klub et gérer vos dons.';
          break;
        case state.url.startsWith('/supports'):
          message =
            'Connectez vous ou créez votre compte pour accéder votre espace Klub et à vos supports de communication.';
          break;
        case state.url.startsWith('/link-member'):
          message =
            'Connectez vous ou créez votre compte pour accepter l\'invitation.';
          break;
        default:
          message = 'Connectez vous ou créez votre compte pour accéder votre espace Klub.';
          break;
      }
      document.cookie = `message=${encodeURIComponent(message)}; path=/; expires=${new Date(Date.now() + (1000 * 60 * 10)).toUTCString()}`;
      if (authFacade.authMode() === 'angular') {
        const returnUrl = state.url && state.url !== '/' ? state.url : null;
        // console.log('%c3-GUARD ME > AUTHMODE angular', 'color: orange', state, state.url, returnUrl, route);
        return router.createUrlTree(['/auth/login'], {queryParams: returnUrl ? {returnUrl} : {}});
      } else {
        // const returnUrl = state.url && state.url !== '/' ? state.url : '/admin';
        const returnUrl = state.url;
        // console.log('%c3-GUARD ME > AUTHMODE nextJs', 'color: orange', state, state.url, returnUrl);
        const redirectFromNextJs = returnUrl ? `?redirect=${encodeURIComponent('/admin' + state.url)}` : '';
        // console.log('%c3-GUARD ME > AUTHMODE nextJs', 'color: orange', redirectFromNextJs);
        window.location.href = environment.nextJsUrl + 'connexion' + redirectFromNextJs;
        return false;
      }
    })
  );
};



