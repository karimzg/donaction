import { ResolveFn, Router } from '@angular/router';
import { inject } from "@angular/core";
import { ProjectService } from "@shared/services/project.service";
import { Observable, of, withLatestFrom } from "rxjs";
import { KlubProject } from "@shared/utils/models/klubr";
import { catchError, map } from "rxjs/operators";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { PermissionsService } from "@shared/services/permissions.service";
import { ToastService } from "@shared/services/misc/toast.service";

export const projectResolver: ResolveFn<null | KlubProject> = (route, state): Observable<null | KlubProject> => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const sharedFacade = inject(SharedFacade);
  const permissionsService = inject(PermissionsService);
  const projectUuid = route.paramMap.get('uuid');

  if (!projectUuid) {
    const message = `L'identifiant du projet est manquant`;
    toastService.showErrorToast('Erreur', message);
    router.navigate(['/project/listing']).then();
    return of(null);
  }
  return inject(ProjectService).getProject(projectUuid, route.data['fromTemplate'] ? 'withTemplates=true' : undefined).pipe(
    catchError((error) => {
        toastService.showErrorToast('Erreur', error.message);
        router.navigate(['/project/listing']).then();
        return of(null);
      }
    ),
    withLatestFrom(sharedFacade.profile$, sharedFacade.currentKlub$),
    map(([project, profile, currentKlub]) => {
      if (!project) {
        const message = `Le projet avec l'identifiant ${projectUuid} n'existe pas`;
        toastService.showErrorToast('Erreur', message);
        router.navigate(['/project/listing']).then();
      }
      if (!profile || !currentKlub) {
        const message = `Votre profil ou votre Klub est manquant`;
        toastService.showErrorToast('Erreur', message);
        router.navigate(['/project/listing']).then();
      }
      if (profile) {
        if (permissionsService.memberIsAdmin(profile)) {
          return project;
        } else if (
          ((permissionsService.memberIsAdminEditor(profile) || permissionsService.memberIsNetwork(profile
            || permissionsService.memberIsLeader(profile))) && (project!.klubr?.uuid !== currentKlub!.uuid) && !project!.isTemplate)
          || (permissionsService.memberIsMember(profile) && (project!.klubr_membre?.uuid !== profile!.uuid) && !project!.isTemplate)
        ) {
          console.log('project', project);
          const message = `Vous n'avez pas les droits pour accéder à ce projet`;
          toastService.showErrorToast('Erreur', message);
          router.navigate(['/project/listing']).then();
        }
        return project;
      }
      return null;
    })
  );
};
