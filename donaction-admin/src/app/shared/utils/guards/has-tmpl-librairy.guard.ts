import { CanActivateFn } from '@angular/router';
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { inject } from "@angular/core";

export const hasTmplLibrairyGuard: CanActivateFn = (route, state) => {
  const sharedFacade = inject(SharedFacade);
  return (sharedFacade.profile()?.klubr?.template_projects_libraries || []).length > 0;
};
