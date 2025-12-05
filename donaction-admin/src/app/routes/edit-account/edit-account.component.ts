import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, effect, inject, signal, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ErrorDisplayComponent } from '@shared/components/form/error-display/error-display.component';
import { AuthFacade } from '../auth/data-access/+state/auth.facade';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from "primeng/password";
import { FocusTrapModule } from "primeng/focustrap";
import { CardModule } from "primeng/card";
import { GenericUpdateComponent } from "@shared/components/generics/generic-update/generic-update.component";
import { UserDetail } from "@shared/utils/models/user-details";
import { merge, Observable, switchMap } from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
import { map, take } from "rxjs/operators";
import * as AuthActions from "../auth/data-access/+state/auth.actions";
import {
  differentPasswordValidator,
  passwordMatchValidator,
  passwordStrengthValidator
} from "@shared/utils/validators/pwd.validators";
import { DividerModule } from "primeng/divider";
import { fadeAnimation } from "@shared/utils/animations/animations";
import { environment } from "@environments/environment";
import { CookieService } from "ngx-cookie-service";
import { ToggleSwitchModule } from "primeng/toggleswitch";

@Component({
  selector: 'app-edit-account',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ErrorDisplayComponent,
    ToastModule,
    PasswordModule,
    FocusTrapModule,
    CardModule,
    DividerModule,
    ToggleSwitchModule,
    FormsModule,
  ],
  templateUrl: './edit-account.component.html',
  providers: [],
  encapsulation: ViewEncapsulation.None,
  animations: [fadeAnimation]
})
export class EditAccountComponent extends GenericUpdateComponent<UserDetail> implements AfterViewInit {

  /* SPECIFIC SERVICES */
  private authFacade: AuthFacade = inject(AuthFacade);
  private cookieService = inject(CookieService);
  private actions$ = inject(Actions);
  public me = this.authFacade.me;
  public isLocalhost = environment.env === 'dev';
  public plausibleTracking = signal(this.cookieService.get('plausibleTraskLocalhost') === 'true');
  isFirstRun = true;

  /* SPECIFIC VARS */
  // MESSAGES
  protected override successMsg = 'Le mot de passe a été mis à jour';
  protected override errorUpdateMsg = 'Le mot de passe n\'a pas pu être modifié';
  protected override routePrefix = '/edit-account';

  constructor() {
    super();
    effect(() => {
      if (this.me()) {
        this.entity.set(this.me()!);
      }
    });
    effect(() => {
      if (this.plausibleTracking()) {
        if (!this.isFirstRun) {
          console.log('Plausible tracking enabled');
          this.cookieService.set('plausibleTraskLocalhost', 'true', undefined, '/');
          this.toastService.showSuccessToast('Tracking activé', 'Rechargement de la page nécessaire');
        }
      } else {
        if (!this.isFirstRun) {
          console.log('Plausible tracking disabled');
          this.cookieService.delete('plausibleTraskLocalhost', '/');
          this.toastService.showSuccessToast('Tracking désactivé', 'Rechargement de la page nécessaire');
        }
      }
      this.isFirstRun = false;
    });
  }

  protected override initForm(): void {
    this.entityForm = new FormGroup({
      currentPassword: new FormControl({value: '', disabled: false},
        Validators.required),
      password: new FormControl({value: '', disabled: false},
        [Validators.required, passwordStrengthValidator()]),
      passwordConfirmation: new FormControl({value: '', disabled: false},
        Validators.required),
    }, {
      validators: [passwordMatchValidator, differentPasswordValidator],
    });
    this.entityForm.updateValueAndValidity();
  }

  protected override setEditMode(entity: UserDetail | null): void {
    this.editMode = !!entity;
  }

  protected override formFields(publish = false): { [key: string]: any } {
    return {
      ...this.entityForm.value,
    };
  }

  protected override serviceUpdate(uuid: string, formValues: any): Observable<UserDetail> {
    this.authFacade.updateMePassword(formValues);
    return merge(
      this.actions$.pipe(
        ofType(AuthActions.changeMePasswordSuccess),
        map(({user}) => user.user),
      ),
      this.actions$.pipe(
        ofType(AuthActions.changeMePasswordFailure),
        switchMap(() => {
          this.entityForm.get('currentPassword')?.setErrors({wrongPassword: true});
          throw Error('Le mot de passe actuel est incorrecte');
        }),
      ),
    ).pipe(
      take(1),
    );
  }

  protected override redirectAfterUpdate(entity: UserDetail): void {
    this.reloadCurrentRoute();
  }
}
