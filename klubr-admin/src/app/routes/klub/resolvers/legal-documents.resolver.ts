import { ResolveFn, Router } from '@angular/router';
import { inject } from "@angular/core";
import { ToastService } from "@shared/services/misc/toast.service";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { PermissionsService } from "@shared/services/permissions.service";
import { of, switchMap, withLatestFrom } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { KlubrService } from "@shared/services/klubr.service";
import { KlubrDocuments } from "@shared/utils/models/klubr";

export const legalDocumentsResolver: ResolveFn<null | KlubrDocuments> = (route, state) => {
  const klubrUuid = route.paramMap.get('uuid');
  const router = inject(Router);
  const toastService = inject(ToastService);
  const sharedFacade = inject(SharedFacade);
  const permissionsService = inject(PermissionsService);
  const klubrService = inject(KlubrService);

  if (!klubrUuid) {
    const message = `L'identifiant du Klub est manquant`;
    toastService.showErrorToast('Erreur', message);
    router.navigate(['/']).then();
    return of(null);

  }
  return klubrService.getKlubrByUuid(klubrUuid, ['klubr_document', 'klubr_info']).pipe(
    catchError((error) => {
        toastService.showErrorToast('Erreur', error.message);
        router.navigate(['/']).then();
        return of(null);
      }
    ),
    // filter((klubr) => {
    //   if (!klubr) {
    //     const message = `Le club avec l'identifiant ${klubrUuid} n'existe pas`;
    //     toastService.showErrorToast('Erreur', message);
    //     router.navigate(['/']).then();
    //     return false;
    //   }
    //   return true
    // }),
    withLatestFrom(sharedFacade.profile$, sharedFacade.currentKlub$),
    map(([klubr, profile, currentKlub]) => {
      if (!klubr) {
        const message = `Le Klub avec l'identifiant ${klubrUuid} n'existe pas`;
        toastService.showErrorToast('Erreur', message);
        router.navigate(['/']).then();
        return false;
      }

      if (!profile || !currentKlub) {
        const message = `Votre profil ou votre Klub est manquant`;
        toastService.showErrorToast('Erreur', message);
        router.navigate(['/']).then();
        return false;
      }

      if (profile) {
        if (permissionsService.memberIsAdmin(profile)) {
          return klubr;
        } else if (
          ((permissionsService.memberIsAdminEditor(profile) || permissionsService.memberIsNetwork(profile)
            || permissionsService.memberIsLeader(profile)) && (klubr?.uuid !== currentKlub!.uuid))
        ) {
          const message = `Vous n'avez pas les droits pour accéder à ce Klub`;
          toastService.showErrorToast('Erreur', message);
          router.navigate(['/']).then();
          return false;
        }
        return klubr;
      }

      return false;
    }),
    switchMap((klubr) => {
      if (klubr === false) {
        return of(null);
      }
      if (klubr?.klubr_document) {
        const klubr_document = {...klubr.klubr_document, klubr};
        return of(klubr_document);
      } else {
        return klubrService.createKlubrDocuments(klubr.uuid).pipe(
          map((klubr_document) => ({...klubr_document, klubr}))
        )
      }
    }),
  );
};
