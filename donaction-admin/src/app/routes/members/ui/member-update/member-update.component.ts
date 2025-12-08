import { AfterViewInit, Component, inject, signal, untracked, ViewEncapsulation, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Media } from "@shared/utils/models/media";
import { AvatarModule } from "primeng/avatar";
import { Button } from "primeng/button";
import { ChipModule } from "primeng/chip";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { AvatarService } from "@shared/services/avatar.service";
import {
  AvatarSelectorComponent
} from "@shared/components/form/upload-avatar/avatar-selector/avatar-selector.component";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { ErrorDisplayComponent } from "@shared/components/form/error-display/error-display.component";
import { defaultKlubMemberFunctions, KlubrMembre, KlubrMembreRole } from "@shared/utils/models/user-details";
import { catchError, map, take, tap } from "rxjs/operators";
import { Observable, of } from "rxjs";
import * as SharedActions from "@shared/data-access/+state/shared.actions";
import { Actions, ofType } from "@ngrx/effects";
import { InplaceModule } from 'primeng/inplace';
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { GenericUpdateComponent } from "@shared/components/generics/generic-update/generic-update.component";
import { ProfileService } from "@shared/services/profile.service";
import {
  InvalidControlScrollDirective
} from "@shared/components/form/invalid-control-scroll/invalid-control-scroll.directive";
import { Select } from "primeng/select";
import { FormControlPipe } from "@shared/pipes/forms/form-control.pipe";
import { PhoneComponent } from "@shared/components/form/phone/phone.component";
import { ProfileRoleLabelPipe } from "@shared/pipes/profile/profile-role-label.pipe";
import { ProfileRoleSeverityPipe } from "@shared/pipes/profile/profile-role-severity.pipe";

@Component({
  selector: 'app-member-update',
  imports: [
    AvatarModule,
    Button,
    ChipModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    AvatarSelectorComponent,
    ErrorDisplayComponent,
    Select,
    InplaceModule,
    InvalidControlScrollDirective,
    FormControlPipe,
    PhoneComponent,
    ProfileRoleLabelPipe,
    ProfileRoleSeverityPipe,
  ],
  providers: [DialogService, MediaPipe],
  templateUrl: './member-update.component.html',
  styleUrl: './member-update.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MemberUpdateComponent extends GenericUpdateComponent<KlubrMembre> implements AfterViewInit {
  /* SPECIFIC SERVICES */
  public avatarService = inject(AvatarService);
  public ref = inject(DynamicDialogRef);
  private actions$ = inject(Actions);
  private mediaPipe = inject(MediaPipe);
  private profileService = inject(ProfileService);
  public config = inject(DynamicDialogConfig);

  /* SPECIFIC VARS */
  // MESSAGES
  protected override successMsg = 'Le profil a été mis à jour';
  protected override errorUpdateMsg = 'Le profil n\'a pas pu être modifié';
  protected override errorCreateMsg = 'Le profil n\'a pas pu être créé';
  protected override routePrefix = '/profile';

  public avatarIsFromLibrary = signal(false);
  public isRoleSelected: WritableSignal<boolean> = signal<boolean>(false);
  public currentAvatar: WritableSignal<Partial<Media> | undefined> = signal<Partial<Media> | undefined>(undefined);

  constructor() {
    super();
    this.entity.set(this.config.data.profile);
  }

  /* FORM INIT */
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
      role: new FormControl({value: entity?.role || undefined, disabled: false},
        Validators.required),
      fonction: new FormControl({value: entity?.fonction, disabled: false},
        Validators.required),
      slug: new FormControl({value: entity?.slug, disabled: false},
        []),
      email: new FormControl({value: entity?.email, disabled: false},
        [Validators.email]),
      tel: new FormControl({value: entity?.tel, disabled: false},
        []),
      numLicence: new FormControl({value: entity?.numLicence, disabled: false},
        []),
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
      role: entity?.role || true,
      fonction: entity?.fonction || '',
      slug: entity?.slug || true,
      email: entity?.email,
      tel: entity?.tel,
      numLicence: entity?.numLicence,
    });
    this.currentAvatar.set(entity?.avatar);
    this.avatarIsFromLibrary.set(!!entity?.avatar?.provider_metadata.avatar);
    this.entityForm.markAsPristine();
  }

  protected override getEntityForCreateMode(member: KlubrMembre | null): KlubrMembre | null {
    member = {
      uuid: '',
      nom: '',
      prenom: '',
      fonction: '',
      role: 'KlubMember',
      avatar: undefined,
      klubr: untracked(this.sharedFacade.profile)!.klubr,
      date_link_user: null,
      slug: undefined,
      createdAt: '',
      updatedAt: '',
      optin_mail_don_project: true,
      optin_mail_don_klub_project: true,
      optin_mail_don_klub: true,
      optin_mail_invoice: true,
      email: undefined,
      tel: undefined,
      numLicence: undefined
    }
    return member;
  }

  protected override formFields(publish = false): { [key: string]: any } {
    return {
      ...this.entityForm.value,
      klubr: this.sharedFacade.profile()!.klubr.uuid,
      uuid: untracked(this.entitySignal)!.uuid,
      avatar: untracked(this.avatarIsFromLibrary) ? {set: [this.entityForm.get('avatar')?.value]} : undefined
    };
  }

  protected override serviceUpdate(uuid: string, formValues: any): Observable<KlubrMembre> {
    this.sharedFacade.updateProfile(uuid, formValues);
    return this.actions$.pipe(
      ofType(SharedActions.updateProfileSuccess),
      map(({profile}) => profile),
      take(1),
    );
  }

  protected override serviceCreate(formValues: any): Observable<KlubrMembre> {
    return this.profileService.createProfile(formValues).pipe(
      map((response) => response.data as KlubrMembre),
    );
  }

  protected override updateFile(member: KlubrMembre): Observable<KlubrMembre> {
    if (!this.avatarIsFromLibrary()
      && this.entityForm.get('avatar')?.valid
      && !this.entityForm.get('avatar')?.pristine
      && this.entityForm.get('avatar')?.value) {
      const formData = new FormData();
      formData.append('avatar', this.entityForm.get('avatar')!.value);
      return this.avatarService.newMediaProfileFile(this.entitySignal()?.uuid!, formData).pipe(
        catchError(() => {
          this.toastService.showErrorToast('Erreur', 'L\'avatar n\'a pas pu être mis à jour');
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

  protected override redirectAfterCreate(entity: KlubrMembre): void {
    this.ref.close(entity);
  }

  protected override redirectAfterUpdate(entity: KlubrMembre): void {
    this.ref.close(entity);
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

  public onRoleSelected(role: KlubrMembreRole): void {
    this.entityForm.get('role')?.setValue(role);
    this.entityForm.get('role')?.markAsDirty();
    this.isRoleSelected.set(!this.isRoleSelected());
    this.entityForm.markAsDirty();
    this.entityForm.markAsTouched();
  }

  close(): void {
    this.ref.close();
  }

  protected readonly defaultKlubMemberFunctions = defaultKlubMemberFunctions;
}
