import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  OnInit,
  output,
  signal,
  WritableSignal
} from '@angular/core';
import { KlubrMembre } from "@shared/utils/models/user-details";
import { TagModule } from "primeng/tag";
import { AvatarModule } from "primeng/avatar";
import { ToastModule } from "primeng/toast";
import { PermissionsService } from "@shared/services/permissions.service";
import { AsyncPipe } from "@angular/common";
import { InvitationPopUpComponent } from "@app/routes/members/ui/invitation-pop-up/invitation-pop-up.component";
import { DialogService } from "primeng/dynamicdialog";
import { ProfileService } from "@shared/services/profile.service";
import { MemberUpdateComponent } from "@app/routes/members/ui/member-update/member-update.component";
import { take } from "rxjs/operators";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { ToastService } from "@shared/services/misc/toast.service";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogWrapperService } from "@shared/components/dialog/confirm-dialog/confirm-dialog-wrapper.service";
import { RoleTagComponent } from "@shared/components/atoms/role-tag/role-tag.component";
import { Menu } from "primeng/menu";
import { MenuItem } from "primeng/api";
import {
  ConnectedProfileHasGreaterRolePipe
} from "@shared/pipes/profile-rights/connected-profile-has-greater-role.pipe";
import { DeviceService } from "@shared/services/device.service";
import { Drawer } from "primeng/drawer";

@Component({
  selector: 'app-member-card',
  imports: [
    TagModule,
    AvatarModule,
    ToastModule,
    AsyncPipe,
    MediaPipe,
    ButtonModule,
    RoleTagComponent,
    Menu,
    ConnectedProfileHasGreaterRolePipe,
    Drawer,
  ],
  providers: [DialogService],
  templateUrl: './member-card.component.html',
  styles: [`
    :host {
      flex: 1 1 32%;
      max-width: 54rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCardComponent implements OnInit {
  public confirmDialogWrapperService = inject(ConfirmDialogWrapperService);
  private toastService = inject(ToastService);
  public permissionsService = inject(PermissionsService);
  public dialogService = inject(DialogService);
  public profileService = inject(ProfileService);
  public sharedFacade = inject(SharedFacade);
  public deviceService = inject(DeviceService);

  profile = model.required<KlubrMembre>();
  onDelete = output<boolean>();

  public menuOptions: MenuItem[] | undefined = [];
  public showActions: WritableSignal<boolean> = signal<boolean>(false);

  ngOnInit() {
    this.menuOptions = [
      {
        label: 'Envoyer une invitation',
        icon: 'pi pi-send',
        command: () => {
          this.showInvitationPopup()
        },
        visible: this.checkInvitationPerm(),
      },
      {
        label: 'Modifier',
        icon: 'pi pi-pencil',
        command: () => {
          this.modifyUser()
        },
        visible: this.permissionsService.memberIsAtLeastLeaderSignal() && this.permissionsService.roleIsGreaterThan(this.sharedFacade.profile()!.role, this.profile()?.role)
      },
      {
        label: 'Supprimer',
        icon: 'pi pi-trash',
        command: (event) => {
          this.deleteUser()
        },
        visible: this.permissionsService.memberIsAtLeastAdminEditorSignal(),
      },
    ]
  }

  public checkInvitationPerm(): boolean | undefined {
    return this.permissionsService.isAtLeastLeaderSignal() && !(this.profile()?.users_permissions_user?.email);
  }

  modifyUser() {
    const ref = this.dialogService.open(MemberUpdateComponent, {
      header: 'Modifiez les informations de ce membre',
      closable: true,
      modal: true,
      width: '75rem',
      contentStyle: {overflow: 'auto'},
      styleClass: 'overflow-visible',
      breakpoints: {
        '1199px': '75vw',
        '575px': '90vw'
      },
      data: {
        profile: this.profile(),
      }
    });

    ref?.onClose.pipe(
      take(1),
    ).subscribe((reponse) => {
      if (reponse) {
        this.toastService.showSuccessToast('Succès', `Le profil a été mis à jour`);
        this.profile.set({...this.profile(), ...reponse});
      }
    });
  }

  deleteUser(/*event: MenuItemCommandEvent*/) {
    this.confirmDialogWrapperService.confirm({
      // target: event.originalEvent?.target as EventTarget,
      message: 'Voulez-vous supprimer cet utilisateur ?',
      header: 'Supprimer cet utilisateur',
      accept: () => {
        this.profileService.deleteProfile(this.profile()?.uuid!).pipe().subscribe({
          next: () => {
            this.toastService.showSuccessToast('Succès', `Le profil a été supprimé`);
            this.onDelete.emit(true);
          },
          error: () => {
            this.toastService.showErrorToast('Erreur', 'Une erreur est survenue lors de la suppression du profil');
          }
        });
      },
    });
  }

  showInvitationPopup() {
    this.dialogService.open(InvitationPopUpComponent, {
      header: `Inviter ${this.profile()!.prenom} ${this.profile()!.nom} à rejoindre mon équipe`,
      width: '75rem',
      modal: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '1199px': '75vw',
        '575px': '90vw'
      },
      data: {
        codeInvitation: this.profile()?.code,
        email: this.profile()?.email,
        codeType: 'profile',
      }
    });
  }

  toggleShowActions(): void {
    this.showActions.update((val) => !val);
  }
}
