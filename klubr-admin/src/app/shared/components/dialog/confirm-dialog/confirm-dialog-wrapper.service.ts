import { Injectable } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { confirmDialogConstants } from "@shared/utils/config/dialog";
import { ConfirmationWrapper } from "@shared/components/dialog/confirm-dialog/confirm-dialog.model";

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogWrapperService {
  private _confirmationSubject: Subject<ConfirmationWrapper> = new Subject();
  public readonly confirmationSubject: Observable<ConfirmationWrapper> = this._confirmationSubject.asObservable();

  public confirm(confirmation: ConfirmationWrapper): void {
    this._confirmationSubject.next({...confirmDialogConstants, ...confirmation})
  }
}
