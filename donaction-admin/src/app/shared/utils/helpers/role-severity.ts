import { KlubrMembreRole, UserRole } from "../models/user-details";
import { Severity } from "../models/misc";

export const setSeverity = (role: KlubrMembreRole | UserRole | undefined): Severity | undefined => {
  switch (role) {
    case 'AdminEditor':
      return 'info';
    case 'Admin':
      return 'danger';
    case 'NetworkLeader':
      return 'info';
    case 'KlubMemberLeader':
      return 'warn';
    case 'KlubMember':
      return 'success';
    case 'Authenticated':
      return 'contrast';
    default:
      return 'danger';
  }
}
