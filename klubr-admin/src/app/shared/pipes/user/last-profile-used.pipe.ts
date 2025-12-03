import { Pipe, PipeTransform } from '@angular/core';
import { KlubrMembre, UserDetail } from "@shared/utils/models/user-details";

@Pipe({
  name: 'lastProfileUsed'
})
export class LastProfileUsedPipe implements PipeTransform {

  transform(user: UserDetail, ...args: unknown[]): KlubrMembre | undefined {
    let lastKlubrMemberUsed: KlubrMembre | undefined;
    if (user.klubr_membres.length > 1) {
      lastKlubrMemberUsed = (
        user.klubr_membres.find((klubrMember) =>
          klubrMember.uuid === user.last_member_profile_used)
      )
    } else {
      lastKlubrMemberUsed = (user.klubr_membres[0]);
    }
    return lastKlubrMemberUsed;
  }

}
