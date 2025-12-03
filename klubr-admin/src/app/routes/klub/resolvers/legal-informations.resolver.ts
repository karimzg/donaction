import { ResolveFn, Router } from '@angular/router';
import { Observable, of, withLatestFrom } from "rxjs";
import { inject } from "@angular/core";
import { ToastService } from "@shared/services/misc/toast.service";
import { Klubr } from "@shared/utils/models/klubr";
import { KlubrService } from "@shared/services/klubr.service";
import { catchError, map } from "rxjs/operators";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { PermissionsService } from "@shared/services/permissions.service";

export const legalInformationsResolver: ResolveFn<null | Klubr> = (route, state): Observable<null | Klubr> => {
  const klubrUuid = route.paramMap.get('uuid');
  const router = inject(Router);
  const toastService = inject(ToastService);
  const sharedFacade = inject(SharedFacade);
  const permissionsService = inject(PermissionsService);

  if (!klubrUuid) {
    const message = `L'identifiant du Klub est manquant`;
    toastService.showErrorToast('Erreur', message);
    router.navigate(['/']).then();
    return of(null);
  }

  return inject(KlubrService).getKlubrByUuid(klubrUuid, ['federationLink']).pipe(
    catchError((error) => {
        toastService.showErrorToast('Erreur', error.message);
        router.navigate(['/']).then();
        return of(null);
      }
    ),
    map((klubr) => klubr || null),
    withLatestFrom(sharedFacade.profile$, sharedFacade.currentKlub$),
    map(([klubr, profile, currentKlub]) => {
      if (!klubr) {
        const message = `Le Klub avec l'identifiant ${klubrUuid} n'existe pas`;
        toastService.showErrorToast('Erreur', message);
        router.navigate(['/']).then();
      }

      if (!profile || !currentKlub) {
        const message = `Votre profil ou votre Klub est manquant`;
        toastService.showErrorToast('Erreur', message);
        router.navigate(['/']).then();
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
        }
        return klubr;
      }

      return null
    })
  );
};
