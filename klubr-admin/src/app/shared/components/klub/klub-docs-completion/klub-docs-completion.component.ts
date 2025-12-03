import { Component, computed, input, untracked } from '@angular/core';
import { Klubr } from "@shared/utils/models/klubr";
import { Severity } from "@shared/utils/models/misc";
import { RouterModule } from "@angular/router";
import { Tag } from "primeng/tag";

@Component({
  selector: 'app-docs-full-completion',
  imports: [
    RouterModule,
    Tag,
  ],
  template: `
    @if (tagDocs(); as tag) {
      <p-tag [value]="tag.label" [severity]="tag.severity" [routerLink]="['/klub', klub()!.uuid, 'documents']"
             class="cursor-pointer"></p-tag>
    }`,
})
export class KlubDocsCompletionComponent {
  klub = input<Klubr>();

  tagDocs = computed<{ label: string, severity: Severity } | null>(() => {
    if (this.klub()) {
      const club = untracked(this.klub)!;
      if (club.klubr_info && club.klubr_document) {
        if (club.klubr_info.requiredDocsValidatedCompletion >= 100) {
          return {label: 'Complet', severity: 'success'};
        } else if (club.klubr_info.requiredDocsWaitingValidationCompletion > 0) {
          return {label: 'Document(s) à valider', severity: 'danger'}
        } else if (club.klubr_info.requiredDocsWaitingValidationCompletion === 0) {
          return {label: 'En attente de documents', severity: 'warn'}
        } else if (club.klubr_info.requiredDocsRefusedCompletion > 0) {
          return {label: 'Document(s) refusé(s)', severity: 'contrast'}
        }
      }
      return null;
    }
    return null;
  });
}
