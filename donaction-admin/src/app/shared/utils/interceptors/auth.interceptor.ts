import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, of, switchMap } from "rxjs";
import { environment } from "@environments/environment";
import { inject } from '@angular/core';
import { AuthFacade } from "@app/routes/auth/data-access/+state/auth.facade";
import { take } from "rxjs/operators";

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authFacade = inject(AuthFacade);
  // const customErrorHandling :Array<string> =[
  //   'api/auth/local'
  // ]
  const apiTokenRoutes: Array<string> = [
    '/api/auth/local',
    // '/api/auth/session',
    '/api/auth/google/callback',
    '/api/auth/reset-password',
    '/api/auth/forgot-password',
    '/api/auth/email-confirmation',
    '/api/connect/',
    '/api/auth/local/register',
    '/api/auth/send-email-confirmation',
  ];

  const unauthenticatedRoutes: Array<string> = [
    (environment.env === "dev" ? "/" : environment.nextJsUrl) + 'api/auth/session',
    (environment.env === "dev" ? "/" : environment.nextJsUrl) + 'api/revalidate',
    "https://maps.googleapis.com/maps/api/js",
  ];
  const isUnauthenticated = unauthenticatedRoutes.some((route) => request.url.startsWith(route));

  const accessToken$ = apiTokenRoutes.some((route) => request.url.includes(route)) ? of(environment.apiTokenV1) : authFacade.token$;
  return accessToken$.pipe(
    take(1),
    switchMap((accessToken) => {
      // console.log('-------------------------------', request.url, isUnauthenticated, accessToken, authFacade.token());
      if (accessToken && !isUnauthenticated) {
        const clonedRequest = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${accessToken}`),
        });
        return next(clonedRequest);
      } else {
        console.log('------------------------------- No token found', request.url);
        return next(request);
      }
    })
  );
};
