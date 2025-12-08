import { inject, Injectable, signal } from '@angular/core';
import { PermissionsService } from "@shared/services/permissions.service";
import { Severity2 } from "@shared/utils/models/misc";
import { KlubrMembreRole } from "@shared/utils/models/user-details";

@Injectable({
  providedIn: 'root'
})
export class MainMessageService {
  private permissionsService = inject(PermissionsService);
  private _messages = signal<MainMessage[]>([]);

  get messages() {
    return this._messages;
  }

  addMessage(message: string, options: {
    type?: Severity2,
    action?: () => void,
    actionIcon?: string,
    actionID?: ActionId,
    memberRestriction?: KlubrMembreRole
  } = {
    type: 'info'
  }) {
    const {memberRestriction, ...restOptions} = options;
    if (!memberRestriction || this.permissionsService.memberIsAtLeast(memberRestriction)) {
      this._messages.update((messages) => [...messages, {message, ...restOptions}]);
    } else {
      console.log('MainMessageService.addMessage: MESSAGE not added for', memberRestriction);
    }

  }

  removeMessage(index: number) {
    this._messages.update((messages) => {
      messages.splice(index, 1);
      return messages;
    });
  }

  clear() {
    this._messages.set([]);
  }
}

export interface MainMessage {
  message: string;
  type?: Severity2;
  action?: () => void;
  actionID?: ActionId;
  actionIcon?: string;
}

export type ActionId = 'installPwa';
