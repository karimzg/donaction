import { Pipe, PipeTransform } from '@angular/core';
import { KlubrMembreRole, roleLabel } from "@shared/utils/models/user-details";

@Pipe({
  name: 'profileRoleLabel'
})
export class ProfileRoleLabelPipe implements PipeTransform {

  transform(role: KlubrMembreRole): string {
    return role && roleLabel(role) || '';
  }

}
