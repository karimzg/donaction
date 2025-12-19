import { ResolveFn, Router } from '@angular/router';
import { Observable, of, withLatestFrom } from "rxjs";
import { inject, untracked } from "@angular/core";
import { ToastService } from "@shared/services/misc/toast.service";
import { DonationDetails } from "@shared/utils/models/donation-details";
import { defaultDonWithAvatarPopulate, DonationService } from "@shared/services/donation-service.service";
import { catchError, map } from "rxjs/operators";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { PermissionsService } from "@shared/services/permissions.service";
import { AuthFacade } from "@app/routes/auth/data-access/+state/auth.facade";

export const donationDetailsResolver: ResolveFn<null | DonationDetails> = (route, state): Observable<null | DonationDetails> => {
  const donUuid = route.paramMap.get('uuid');
  const toastService = inject(ToastService);
  const router = inject(Router);
  const shareFacade = inject(SharedFacade);
  const authFacade = inject(AuthFacade);
  const permissionsService = inject(PermissionsService);

  if (!donUuid) {
    const message = `Ce don n'existe pas`;
    toastService.showErrorToast('Erreur', message);
    router.navigate(['/don/listing']).then();
    return of(null);
  }
  return inject(DonationService).getDonByUuid(donUuid, [
    ...defaultDonWithAvatarPopulate
    , ...(untracked(permissionsService.memberIsAtLeastLeaderSignal) ? ['invoice', 'klub_don_payments'] : [])
    , ...(untracked(permissionsService.memberIsAdminSignal) || route.queryParams['mes-dons'] ? ['klub_don_contribution', 'klub_don'] : [])
  ]).pipe(
    catchError((error) => {
        toastService.showErrorToast('Erreur', error.message);
        router.navigate(['/don/listing']).then();
        return of(null);
      }
    ),
    map((don) => don || null),
    withLatestFrom(shareFacade.profile$, shareFacade.currentKlub$, authFacade.me$),
    map(([don, profile, currentKlub, me]) => {
      if (!don) {
        const message = `Le don avec l'identifiant ${donUuid} n'existe pas`;
        toastService.showErrorToast('Erreur', message);
        router.navigate(['/don/listing']).then();
      }
      if (!profile || !currentKlub) {
        const message = `Votre profil ou votre Klub est manquant`;
        toastService.showErrorToast('Erreur', message);
        router.navigate(['/don/listing']).then();
      }
      console.log('**************', route.queryParams['mes-dons']);
      if (profile) {
        if (permissionsService.memberIsAdmin(profile)) {
          return don;
        } else if (
          route.queryParams['mes-dons'] && don?.klubDonateur.email === me?.email
        ) {
          return don;
        } else if (
          !permissionsService.memberIsAtLeastLeaderSignal()
          || (permissionsService.memberIsAtLeastLeaderSignal() && (don?.klubr?.uuid !== currentKlub!.uuid))
        ) {
          const message = `Vous n'avez pas les droits pour accéder à ce don`;
          toastService.showErrorToast('Erreur', message);
          router.navigate(['/don/listing']).then();
        }
        return don;
      }
      return null;
    })
  )
};
