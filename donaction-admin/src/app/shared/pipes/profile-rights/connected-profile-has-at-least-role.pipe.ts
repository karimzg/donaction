import { inject, Pipe, PipeTransform } from '@angular/core';
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { PermissionsService } from "@shared/services/permissions.service";
import { KlubrMembre } from "@shared/utils/models/user-details";

@Pipe({
  name: 'connectedProfileHasAtLeastRole',
  standalone: true
})
export class ConnectedProfileHasAtLeastRolePipe implements PipeTransform {
  private sharedFacade = inject(SharedFacade);
  private permissionsService = inject(PermissionsService);

  transform(profile: KlubrMembre | undefined): boolean {
    if (!this.sharedFacade.profile()) {
      return false;
    }
    if (!profile) {
      return true;
    }
    return this.permissionsService.roleIsAtLeast(this.sharedFacade.profile()!.role, profile.role);
  }

}
