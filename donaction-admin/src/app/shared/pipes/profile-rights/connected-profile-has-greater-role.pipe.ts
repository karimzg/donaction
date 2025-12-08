import { inject, Pipe, PipeTransform } from '@angular/core';
import { KlubrMembre } from "@shared/utils/models/user-details";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { PermissionsService } from "@shared/services/permissions.service";

@Pipe({
  name: 'connectedProfileHasGreaterRole',
  standalone: true
})
export class ConnectedProfileHasGreaterRolePipe implements PipeTransform {
  private sharedFacade = inject(SharedFacade);
  private permissionsService = inject(PermissionsService);

  transform(profile: KlubrMembre | undefined): boolean {
    if (!this.sharedFacade.profile()) {
      return false;
    }
    if (!profile) {
      return true;
    }
    return this.permissionsService.roleIsGreaterThan(this.sharedFacade.profile()!.role, profile.role);
  }

}
