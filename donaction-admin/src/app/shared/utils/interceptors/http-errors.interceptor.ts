import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, delay, switchMap, tap } from 'rxjs/operators';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthFacade } from "@app/routes/auth/data-access/+state/auth.facade";
import { ToastService } from "@shared/services/misc/toast.service";

export const httpErrorsInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authFacade = inject(AuthFacade);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error instanceof Blob) {
        return readFileAsObservable(error.error).pipe(
          switchMap((result) => {
            let returnedError = JSON.parse(result);
            returnedError = returnedError.error || returnedError;
            const errorDetails: Array<string> | undefined = Array.isArray(returnedError.details) ?
              returnedError.details
              : (returnedError.details ? Object.entries(returnedError.details).map(([k, v]) => `${k} >${v}`) : undefined);
            const errorMsgHtml = (returnedError.message ? `<b>${returnedError.message}</b>` : `<b>Une erreur est survenue</b>`)
              + (errorDetails?.length ? ': <ul><li>' + errorDetails.join('</li><li>') + '</li></ul>' : '');
            const errorMsg = (returnedError.message ? `${returnedError.message}` : `Une erreur est survenue`)
              + (errorDetails?.length ? ': ' + errorDetails.join(' | ') : '');
            toastService.showErrorToast('Erreur', errorMsg || 'Une erreur inconnue est survenue');
            return throwError(() => ({
              ...error,
              message: errorMsgHtml
            }));
          })
        );
      } else {
        if (error.status === 403) {
          toastService.showErrorToast('Erreur', 'Votre session a expiré, vous allez être redirigé(e) vers la page de login');
          return of(null).pipe(
            delay(3000),
            tap(() => authFacade.logout()),
            switchMap(() => throwError(() => new Error(error.message)))
          );
        } else if (error.status === 400) {
          console.log('httpErrorsInterceptor ERROR 400', error);
          toastService.showErrorToast('Erreur', error?.error?.error?.message || 'Une erreur serveur est survenue');
        } else if (error.status === 504) {
          console.log('httpErrorsInterceptor ERROR 504', error);
          toastService.showErrorToast('Erreur réseau', `La connexion n'est pas stable ou pas disponible, veuillez réessayer`);
          return NEVER;
        } else {
          console.log('httpErrorsInterceptor ERROR OTHER', error);
          toastService.showErrorToast('Erreur', error?.error?.error?.message || 'Une erreur inconnue est survenue');
        }
        return throwError(() => error);
      }
    })
  );
};

export const readFileAsObservable = (blob: Blob): Observable<string> => {
  return new Observable<string>((observer) => {
    const reader = new FileReader();
    reader.onload = () => {
      observer.next(reader.result as string);
      observer.complete();
    };
    reader.onerror = () => {
      observer.error(new Error('Error reading file'));
    };
    reader.readAsText(blob);
  });
}
