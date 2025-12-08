import { Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { environment } from "@environments/environment";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { Button } from "primeng/button";
import { ChipModule } from "primeng/chip";
import { PermissionsService } from "@shared/services/permissions.service";
import { NgClass } from "@angular/common";
import { KlubrMembreRole } from "@shared/utils/models/user-details";
import { InvitationPopUpComponent } from "../members/ui/invitation-pop-up/invitation-pop-up.component";
import { DialogService } from "primeng/dynamicdialog";
import { Klubr } from "@shared/utils/models/klubr";
import { InvalidateCacheService } from "@shared/services/invalidate-cache.service";
import { ToastModule } from "primeng/toast";
import { PreviewService } from "@shared/services/preview.service";
import { ToastService } from "@shared/services/misc/toast.service";
import { TooltipModule } from "primeng/tooltip";
import { PleaseCompleteKlubModalComponent } from "./please-complete-klub-modal/please-complete-klub-modal.component";
import { fadeAnimation } from "@shared/utils/animations/animations";
import { KlubrService } from "@shared/services/klubr.service";
import { ConfirmDialogWrapperService } from "@shared/components/dialog/confirm-dialog/confirm-dialog-wrapper.service";
import { take } from "rxjs/operators";
import { LottieComponent } from "ngx-lottie";
import { KlubStatsComponent } from "@shared/components/klub/stats/klub-stats/klub-stats.component";

@Component({
  selector: 'app-homepage',
  imports: [
    ChipModule,
    Button,
    NgClass,
    ToastModule,
    TooltipModule,
    LottieComponent,
    KlubStatsComponent,
  ],
  providers: [DialogService],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
  animations: [fadeAnimation],
})
export class HomepageComponent {
  public sharedFacade = inject(SharedFacade);
  public permissionsService = inject(PermissionsService);
  public dialogService = inject(DialogService);
  public invalidateCacheService = inject(InvalidateCacheService);
  public toastService = inject(ToastService);
  public previewService = inject(PreviewService);
  public klubrService = inject(KlubrService);
  public confirmDialogWrapperService = inject(ConfirmDialogWrapperService);

  public selectedRole: WritableSignal<KlubrMembreRole> = signal('KlubMember');
  public currentKlub: Signal<Klubr | undefined> = this.sharedFacade.currentKlub;
  public isLoading = signal(false);
  public allNotifications = signal<boolean>(true);

  webSiteUrl = environment.nextJsUrl;

  redirectToKlubr() {
    this.previewService.previewClub(this.sharedFacade.profile()?.klubr!);
  }

  revalidateCache() {
    const path = `/${this.currentKlub()?.slug}`;
    console.log('revalidateCache', path);
    this.confirmDialogWrapperService.confirm({
      message: `Confirmez-vous vouloir rendre visibles les modifications de votre page Klub ?`,
      header: `Rendre visible les modifications de votre page Klub`,
      acceptLabel: 'Rendre visible',
      accept: () => {
        this.invalidateCacheService.unvalidateCache([path], undefined).pipe(take(1)).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.toastService.showSuccessToast('Page rafraîchie', `La page ${environment.nextJsUrl + path} a été rafraîchie avec succès`);
          },
          error: (error) => {
            this.toastService.showErrorToast('Erreur', error.message);
            this.isLoading.set(false);
          },
        });
      },
    });
  }

  enableKlubr(klubUuid: string, disable = false) {
    this.confirmDialogWrapperService.confirm({
      message: `Confirmez-vous vouloir ${disable ? 'désactiver' : 'activer'} la page de votre Klub ?`,
      header: `${disable ? 'Désactiver' : 'Activer'} la page de votre Klub`,
      acceptLabel: `${disable ? 'Désactiver' : 'Activer'}`,
      accept: () => {
        this.klubrService.toggleKlubState(this.currentKlub(), disable).subscribe({
          complete: () => {
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  showPleaseCompleteKlubPopup() {
    this.dialogService.open(PleaseCompleteKlubModalComponent, {
        header: 'Validation de votre Klub',
        width: '55rem',
        modal: true,
        closable: true,
        contentStyle: {overflow: 'auto'},
        breakpoints: {
          '1199px': '50vw',
          '575px': '90vw'
        },
        data: {
          klub: this.currentKlub(),
          type: 'klub'
        }
      }
    );
  }

  showInvitationPopup() {
    this.dialogService.open(InvitationPopUpComponent, {
      header: `Inviter de nouveaux ${this.selectedRole() === 'KlubMemberLeader' ? 'dirigeants' : 'membres'} à rejoindre mon équipe`,
      width: '75rem',
      modal: true,
      closable: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '1199px': '75vw',
        '575px': '90vw'
      },
      data: {
        codeInvitation: this.selectedRole() === 'KlubMemberLeader' ? this.currentKlub()?.codeLeader : this.currentKlub()?.code,
        codeType: 'club'
      }
    });
  }


  toggleAllNotifications(value: boolean) {
    this.allNotifications.set(value);
  }
}
