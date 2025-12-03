import { ResolveFn, Router } from '@angular/router';
import { Observable, of, withLatestFrom } from "rxjs";
import { inject } from "@angular/core";
import { ToastService } from "@shared/services/misc/toast.service";
import { catchError, map } from "rxjs/operators";
import { defaultKlubrHouseWithLogoPopulate, KlubrService } from "@shared/services/klubr.service";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { PermissionsService } from "@shared/services/permissions.service";
import { KlubrHouse } from "@shared/utils/models/klubr";

export const klubHouseResolver: ResolveFn<null | KlubrHouse> = (route, state): Observable<null | KlubrHouse> => {
  const klubrUuid = route.paramMap.get('uuid');
  const sharedFacade = inject(SharedFacade);
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (!klubrUuid) {
    const message = `L'identifiant du Klub est manquant`;
    toastService.showErrorToast('Erreur', message);
    router.navigate(['/']).then();
    return of(null);
  }
  return inject(KlubrService).getKlubrHouseByKlubrUuid(klubrUuid, defaultKlubrHouseWithLogoPopulate).pipe(
    catchError((error) => {
        toastService.showErrorToast('Erreur', error.message);
        router.navigate(['/']).then();
        return of(null);
      }
    ),
    map((klubrHouse) => klubrHouse?.data[0] || null),
    withLatestFrom(sharedFacade.profile$, sharedFacade.currentKlub$),
    map(([klubrHouse, profile, currentKlub]) => {
      if (!klubrHouse) {
        const message = `Le Klub house avec l'identifiant ${klubrUuid} n'existe pas`;
        toastService.showErrorToast('Erreur', message);
        router.navigate(['/']).then();
      }
      if (!profile || !currentKlub) {
        const message = `Votre profil ou votre Klub est manquant`;
        toastService.showErrorToast('Erreur', message);
        router.navigate(['/']).then();
      }
      if (profile) {
        console.log("klubHouseResolver > profile", permissionsService.memberIsAtLeastLeaderSignal());
        if (permissionsService.memberIsAdmin(profile)) {
          return klubrHouse;
        } else if (
          !permissionsService.memberIsAtLeastLeaderSignal()
          || (permissionsService.memberIsAtLeastLeaderSignal() && (klubrHouse?.klubr?.uuid !== currentKlub!.uuid))
        ) {
          const message = `Vous n'avez pas les droits pour accéder à ce Klub`;
          toastService.showErrorToast('Erreur', message);
          router.navigate(['/']).then();
        }
        return klubrHouse;
      }
      return null;
    })
  );
};
