import { AfterViewInit, Component, inject, signal, untracked, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from 'primeng/inputtext';
import { RoleTagComponent } from "@shared/components/atoms/role-tag/role-tag.component";
import { defaultKlubMemberFunctions, KlubrMembre } from "@shared/utils/models/user-details";
import { AvatarModule } from "primeng/avatar";
import { Media } from "@shared/utils/models/media";
import { ToastModule } from "primeng/toast";
import { FileUploadModule } from "primeng/fileupload";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { DialogModule } from "primeng/dialog";
import { DialogService } from "primeng/dynamicdialog";
import { CardModule } from "primeng/card";
import { ErrorDisplayComponent } from "@shared/components/form/error-display/error-display.component";
import { AvatarService } from "@shared/services/avatar.service";
import {
  AvatarSelectorComponent
} from "@shared/components/form/upload-avatar/avatar-selector/avatar-selector.component";
import { FocusTrapModule } from "primeng/focustrap";
import { GenericUpdateComponent } from "@shared/components/generics/generic-update/generic-update.component";
import { merge, Observable, of, switchMap } from "rxjs";
import { catchError, map, take, tap } from "rxjs/operators";
import * as SharedActions from "@shared/data-access/+state/shared.actions";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { Actions, ofType } from "@ngrx/effects";
import { SelectButtonModule } from "primeng/selectbutton";
import {
  InvalidControlScrollDirective
} from "@shared/components/form/invalid-control-scroll/invalid-control-scroll.directive";
import { ButtonModule } from "primeng/button";
import { PhoneComponent } from "@shared/components/form/phone/phone.component";
import { FormControlPipe } from "@shared/pipes/forms/form-control.pipe";
import { Select } from "primeng/select";
import { fadeAnimation } from "@shared/utils/animations/animations";

@Component({
  selector: 'app-profile',
  imports: [
    CardModule,
    ReactiveFormsModule,
    InputTextModule,
    RoleTagComponent,
    AvatarModule,
    ToastModule,
    FileUploadModule,
    OverlayPanelModule,
    DialogModule,
    ErrorDisplayComponent,
    AvatarSelectorComponent,
    FocusTrapModule,
    SelectButtonModule,
    InvalidControlScrollDirective,
    ButtonModule,
    PhoneComponent,
    FormControlPipe,
    Select,
  ],
  providers: [DialogService, MediaPipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  animations: [fadeAnimation]
})

export class ProfileComponent extends GenericUpdateComponent<KlubrMembre> implements AfterViewInit {
  /* SPECIFIC SERVICES */
  public avatarService = inject(AvatarService);
  private actions$ = inject(Actions);
  private mediaPipe = inject(MediaPipe);

  /* SPECIFIC VARS */
  // MESSAGES
  protected override successMsg = 'Le profil a été mis à jour';
  protected override errorUpdateMsg = 'Le profil n\'a pas pu être modifié';
  protected override errorCreateMsg = 'Le profil n\'a pas pu être créé';
  protected override routePrefix = '/profile';

  public currentAvatar: WritableSignal<Partial<Media> | undefined> = signal<Partial<Media> | undefined>(undefined);
  public avatarIsFromLibrary = signal(false);

  constructor() {
    super();
  }

  /* OVERRIDE METHODS */
  protected override initForm(): void {
    const entity = untracked(this.entitySignal);
    this.entityForm = new FormGroup({
      avatar: new FormControl({
          value: this.mediaPipe.transform(entity?.avatar, 'avatar') || undefined,
          disabled: false
        },
        Validators.required),
      nom: new FormControl({value: entity?.nom || undefined, disabled: false},
        Validators.required),
      prenom: new FormControl({value: entity?.prenom || undefined, disabled: false},
        Validators.required),
      fonction: new FormControl({value: entity?.fonction || undefined, disabled: false},
        Validators.required),
      email: new FormControl({value: entity?.email || undefined, disabled: false},
        [Validators.email]),
      tel: new FormControl({value: entity?.tel || undefined, disabled: false},
        []),
      numLicence: new FormControl({value: entity?.numLicence || undefined, disabled: false},
        []),
      optin_mail_don_project: new FormControl({value: entity?.optin_mail_don_project, disabled: false},
        Validators.required),
      optin_mail_don_klub_project: new FormControl({
          value: entity?.optin_mail_don_klub_project,
          disabled: false
        },
        Validators.required),
      optin_mail_don_klub: new FormControl({value: entity?.optin_mail_don_klub, disabled: false},
        Validators.required),
      optin_mail_invoice: new FormControl({value: entity?.optin_mail_invoice, disabled: false},
        Validators.required),
    });
    this.currentAvatar.set(entity?.avatar);
    this.entityForm.updateValueAndValidity();
  }

  public override resetForm(): void {
    const entity = untracked(this.entitySignal);
    this.entityForm.patchValue({
      avatar: entity?.avatar?.id || undefined,
      nom: entity?.nom || '',
      prenom: entity?.prenom || '',
      fonction: entity?.fonction || '',
      email: entity?.email || '',
      tel: entity?.tel || '',
      numLicence: entity?.numLicence || '',
      optin_mail_don_project: entity?.optin_mail_don_project || false,
      optin_mail_don_klub_project: entity?.optin_mail_don_klub_project || false,
      optin_mail_don_klub: entity?.optin_mail_don_klub || false,
      optin_mail_invoice: entity?.optin_mail_invoice || false,
    });
    this.currentAvatar.set(entity?.avatar);
    this.avatarIsFromLibrary.set(!!entity?.avatar?.provider_metadata.avatar);
    this.entityForm.markAsPristine();
  }

  protected override setEditMode(entity: KlubrMembre | null): void {
    this.editMode = !!entity;
  }

  protected override formFields(publish = false): { [key: string]: any } {
    const entity = untracked(this.entitySignal);
    return {
      ...this.entityForm.value,
      email: this.entityForm.value.email?.length ? this.entityForm.value.email : undefined,
      klubr: entity!.klubr.uuid,
      uuid: entity!.uuid,
      avatar: untracked(this.avatarIsFromLibrary) ? {set: [this.entityForm.get('avatar')?.value]} : undefined
    };
  }

  protected override serviceUpdate(uuid: string, formValues: any): Observable<KlubrMembre> {
    this.sharedFacade.updateProfile(uuid, formValues);
    return merge(
      this.actions$.pipe(
        ofType(SharedActions.updateProfileSuccess),
        map(({profile}) => profile),
      ),
      this.actions$.pipe(
        ofType(SharedActions.updateProfileFailure),
        switchMap((error) => {
          throw Error(error.error?.details?.errors?.map((err: any) => err.path?.join('/')) || 'Erreur');
        }),
      ),
    ).pipe(
      take(1),
    );
  }

  protected override updateFile(member: KlubrMembre): Observable<KlubrMembre> {
    if (!untracked(this.avatarIsFromLibrary)
      && this.entityForm.get('avatar')?.valid
      && !this.entityForm.get('avatar')?.pristine
      && this.entityForm.get('avatar')?.value) {
      const entity = untracked(this.entitySignal);
      const formData = new FormData();
      formData.append('avatar', this.entityForm.get('avatar')!.value);
      return this.avatarService.newMediaProfileFile(entity?.uuid!, formData).pipe(
        catchError(() => {
          this.toastService.showErrorToast('Erreur', `L'avatar n'a pas pu être mis à jour`);
          return of(member);
        }),
        take(1),
        tap((profileUpdated) => this.sharedFacade.updateProfileAvatar(profileUpdated.uuid, profileUpdated.avatar!)),
        map((profileUpdated) => ({...member, ...profileUpdated})),
      );
    } else {
      return of(member);
    }
  }

  /* SPECIFICS METHODS */
  public onFileSelected(file: File): void {
    this.entityForm.patchValue({avatar: file});
    this.entityForm.get('avatar')!.markAsDirty();
    this.avatarIsFromLibrary.set(false);
    const reader = new FileReader();
    reader.onload = () => {
      this.currentAvatar.set({url: reader.result as string});
    };
    reader.readAsDataURL(file);
  }

  public onAvatarSelected(avatar: Media): void {
    this.currentAvatar.set(avatar);
    this.entityForm.get('avatar')?.setValue(avatar.id);
    this.entityForm.get('avatar')?.markAsDirty();
    this.avatarIsFromLibrary.set(true);
    this.entityForm.markAsDirty();
    this.entityForm.markAsTouched();
  }

  protected readonly defaultKlubMemberFunctions = defaultKlubMemberFunctions;
}
