import { CanActivateFn, Router } from '@angular/router';
import { inject } from "@angular/core";
import { ToastService } from "@shared/services/misc/toast.service";
import { map } from "rxjs/operators";
import { PermissionsService } from "@shared/services/permissions.service";

export const isAdminGuard: CanActivateFn = (route, state) => {
  // const authFacade = inject(AuthFacade);
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return permissionsService.isAdmin$.pipe(
    map(isAdmin => {
      if (isAdmin) {
        return true;
      } else {
        router.navigate(['/']);
        toastService.showWarnToast('Accès interdit', 'Vous n\'avez pas les droits pour accéder à cette page', 'keep-while-routing');
        return false;
      }
    })
  );
};
