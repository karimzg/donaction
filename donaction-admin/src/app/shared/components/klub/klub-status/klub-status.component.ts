import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { Klubr } from "@shared/utils/models/klubr";
import { Severity, Severity2 } from "@shared/utils/models/misc";
import { Tag } from "primeng/tag";
import { ConfirmDialogWrapperService } from "@shared/components/dialog/confirm-dialog/confirm-dialog-wrapper.service";
import { KlubrService } from "@shared/services/klubr.service";
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-klub-status',
  imports: [
    Tag,
    NgClass,
  ],
  template: `
    @if (tag(); as tag) {
      <p-tag
        [value]="tag.label"
        [severity]="tag.severity"
        [ngClass]="{'cursor-pointer': klubWork().status !== 'deleted'}"
        (click)="klubWork().status !== 'deleted' && enableKlubr(klubWork().status === 'published')"></p-tag>
    }
  `,
})
export class KlubStatusComponent {
  public confirmDialogWrapperService = inject(ConfirmDialogWrapperService);
  public klubrService = inject(KlubrService);

  klub = input.required<Klubr>();
  klubWork = linkedSignal(this.klub);
  tag = computed<{ label: string, severity: Severity } | null>(() => {
    switch (this.klubWork().status) {
      case 'draft':
        return {label: 'Brouillon', severity: 'warn'};
      case 'published':
        return {label: 'Publié', severity: 'success'};
      case 'deleted':
        return {label: 'Supprimé', severity: 'danger'};
      default:
        return null;
    }
  });

  enableKlubr(disable = false) {
    const message = `Confirmez-vous vouloir ${disable ? 'désactiver' : 'activer'} la page du Klub ${this.klubWork().denomination} ?`;
    const alertMsg: {
      severity: Severity2,
      text: string
    } | undefined = !disable
      ? ((this.klubWork().klubr_info?.requiredDocsValidatedCompletion || 0) < 100
        ? {
          severity: 'error',
          text: 'Toutes les informations nécessaires ne sont pas renseignées (informations, documents, etc.)'
        }
        : {severity: 'warn', text: 'Cette action est irréversible'})
      : undefined;
    this.confirmDialogWrapperService.confirm({
      message,
      alertMsg,
      header: `${disable ? 'Désactiver' : 'Activer'} la page d'un Klub`,
      acceptLabel: `${disable ? 'Désactiver' : 'Activer'}`,
      accept: () => {
        this.klubrService.toggleKlubState(this.klubWork(), disable).subscribe({
          next: () => {
            this.klubWork.set({...this.klubWork(), status: disable ? 'draft' : 'published'});
          },
        });
      }
    });
  }
}
