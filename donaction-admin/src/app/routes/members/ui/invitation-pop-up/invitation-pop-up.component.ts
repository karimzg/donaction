import { Component, inject, OnInit, signal, WritableSignal, } from '@angular/core';
import { AvatarModule } from "primeng/avatar";
import { Button } from "primeng/button";
import { ChipModule } from "primeng/chip";
import { DialogModule } from "primeng/dialog";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { environment } from "@environments/environment";
import { ErrorDisplayComponent } from "@shared/components/form/error-display/error-display.component";
import { InvitationService } from "@shared/services/invitation.service";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { DeviceService } from "@shared/services/device.service";
import { AvatarGroupModule } from "primeng/avatargroup";
import { ToastService } from "@shared/services/misc/toast.service";
import { AnalyticsService } from "@shared/services/analytics/analytics.service";

@Component({
  selector: 'app-invitation-pop-up',
  imports: [
    AvatarModule,
    AvatarGroupModule,
    Button,
    ChipModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    ErrorDisplayComponent
  ],
  templateUrl: './invitation-pop-up.component.html',
  styles: [
    `
      .invitation-link {
        max-width: calc(100vw - 11rem);
      }
    `
  ]
})
export class InvitationPopUpComponent implements OnInit {
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  private fb = inject(FormBuilder);
  public toastService = inject(ToastService);
  public invitationService = inject(InvitationService);
  public deviceService = inject(DeviceService);
  public sharedFacade = inject(SharedFacade);
  public analyticsService = inject(AnalyticsService);
  public invitationLink: WritableSignal<string> = signal('');
  public invitationLinkSm: WritableSignal<string> = signal('');
  public invitationCode: WritableSignal<string> = signal('');
  public invitationType: WritableSignal<'club' | 'profile'> = signal('club');
  /* Forms */
  public sendInvitationForm: FormGroup = new FormGroup({});
  public isSubmitted = signal(false);
  public loading = signal(false);


  constructor() {
    this.analyticsService.trackPageview({customUrl: '/invitation-pop-up'});
  }

  ngOnInit(): void {
    if (this.config.data.codeInvitation) {
      this.invitationCode.set(this.config.data.codeInvitation);
      this.invitationLink.set(environment.nextJsUrl + 's/' + this.config.data.codeInvitation);
      this.invitationLinkSm.set(environment.nextJsUrlSm + 's/' + this.config.data.codeInvitation);
    }
    if (this.config.data.codeType) {
      this.invitationType.set(this.config.data.codeType);
    }
    this.sendInvitationForm = this.fb.group({
      email: this.fb.control(this.config.data.email || '', [Validators.email, Validators.required]),
    });
    if (this.config.data.email) {
      this.sendInvitationForm.get('email')?.markAsDirty();
    }
  }

  copyToClipboard(value: string) {
    navigator.clipboard.writeText(value).then(() => {
      this.toastService.showSuccessToast('Copié', 'Lien copié dans le presse-papier');
    }).catch(() => {
      this.toastService.showErrorToast('Erreur', 'Impossible de copier le lien');
    });
  }


  canShare(): boolean {
    return !!navigator.share;
  }

  /* SHARE METHODS */
  shareMobile() {
    const text = `${this.sharedFacade.profile()?.prenom} ${this.sharedFacade.profile()?.nom} vous invite à rejoindre `
      + `${this.sharedFacade.currentKlub()?.denomination} sur klubr.fr. Cliquez sur le lien et connectez-vous pour rejoindre le Klub `;
    const data = {
      title: 'Envoyer une invitation à rejoindre le Klub sur klubr.fr',
      text,
      url: this.invitationLink(),
    };
    console.log(navigator.canShare(data));
    if (navigator.share && navigator.canShare(data)) {

      navigator
        .share(data)
        .then(() => {
          this.toastService.showSuccessToast('Invitation envoyée', 'L\'invitation a bien été envoyée');
          this.close();
        })
        .catch(() => {
          this.toastService.showErrorToast('Erreur', 'Un problème est survenu lors du partage.');
        });
    } else {
      this.toastService.showWarnToast('Alerte', 'La fonction de partage n’est pas prise en charge sur ce navigateur.');
    }
  }

  // Not used
  share2(socialNetwork: 'whatsapp' | 'messenger' = 'whatsapp') {
    const message = `${this.sharedFacade.profile()?.prenom} ${this.sharedFacade.profile()?.nom} vous invite à rejoindre `
      + `${this.sharedFacade.currentKlub()?.denomination} sur klubr.fr. Cliquez sur le lien et connectez-vous pour rejoindre le Klub :` + this.invitationLink();
    let url = '';
    switch (socialNetwork) {
      case 'whatsapp':
        // url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
      case 'messenger':
        url = `fb-messenger://share?link=${encodeURIComponent(message)}`;
        break;

    }
    window.open(url, '_blank', 'width=600,height=400');
  }

  onSubmit() {
    if (!this.sharedFacade.currentKlub()?.uuid) {
      this.toastService.showErrorToast('Erreur', 'Le Klub n\'est pas défini');
    }
    if (this.sendInvitationForm.valid) {
      this.isSubmitted.set(true);
      this.loading.set(true);
      const request = this.invitationType() === 'club'
        ? this.invitationService.sendInvitationClub(this.invitationCode(), [this.sendInvitationForm.value.email])
        : this.invitationService.sendInvitationProfile(this.invitationCode(), [this.sendInvitationForm.value.email]);
      request.subscribe({
        complete: () => {
          this.loading.set(false);
          this.ref.close();
        },
        next: () => {
          this.toastService.showSuccessToast('Invitation envoyée', 'L\'invitation a bien été envoyée');
        },
        error: () => {
          this.loading.set(false);
          this.toastService.showErrorToast('Erreur', 'Une erreur est survenue lors de l\'envoi de l\'invitation');
        }
      });
    }
  }

  close() {
    this.ref.close();
  }
}
