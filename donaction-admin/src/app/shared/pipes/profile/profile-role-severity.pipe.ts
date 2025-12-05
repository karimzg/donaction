import { Pipe, PipeTransform } from '@angular/core';
import { KlubrMembreRole } from "@shared/utils/models/user-details";
import { Severity } from "@shared/utils/models/misc";
import { setSeverity } from "@shared/utils/helpers/role-severity";

@Pipe({
  name: 'profileRoleSeverity'
})
export class ProfileRoleSeverityPipe implements PipeTransform {
  transform(role: KlubrMembreRole): Severity {
    return role ? setSeverity(role) : 'secondary';
  }

}
