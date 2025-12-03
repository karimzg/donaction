import { Component, computed, inject, signal, untracked, ViewEncapsulation, WritableSignal } from '@angular/core';
import { BadgeModule } from "primeng/badge";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ApiListResult } from "@shared/utils/models/misc";
import { Klubr } from "@shared/utils/models/klubr";
import { KlubInfosComponent } from "@shared/components/klub/klub-infos/klub-infos.component";
import { defaultKlubrForAdminPopulate, defaultKlubrSort, KlubrService } from "@shared/services/klubr.service";
import { COL_FILTERS_LIST_VALUES, KlubFilters } from "../../model/klub-filters";
import { MultiSelectModule } from "primeng/multiselect";
import { KlubFiltersComponent } from "../klub-filters/klub-filters.component";
import { RouterModule } from "@angular/router";
import { GenericListingComponent } from "@shared/components/generics/generic-listing/generic-listing.component";
import { Observable } from "rxjs";
import {
  ListLoadingNoResultsComponent
} from "@shared/components/lists/list-loading-no-results/list-loading-no-results.component";
import { ListHeaderComponent } from "@shared/components/lists/list-header/list-header.component";
import { KlubStatusComponent } from "@shared/components/klub/klub-status/klub-status.component";
import {
  KlubDocsCompletionComponent
} from "@shared/components/klub/klub-docs-completion/klub-docs-completion.component";
import {
  KlubInfosCompletionComponent
} from "@shared/components/klub/klub-infos-completion/klub-infos-completion.component";
import { ValidatedInfoComponent } from "@shared/components/atoms/validated-info/validated-info.component";
import { TooltipModule } from "primeng/tooltip";
import { environment } from "@environments/environment";
import { CurrencyPipe, DatePipe, NgClass } from "@angular/common";
import { Tag } from "primeng/tag";
import { DeviceService } from "@shared/services/device.service";
import { LastUpdatedAtPipe } from "@shared/pipes/klub/last-updated-at.pipe";
import { PdfService } from "@shared/services/pdf.service";
import { Drawer } from "primeng/drawer";
import { ConfirmDialogWrapperService } from "@shared/components/dialog/confirm-dialog/confirm-dialog-wrapper.service";

@Component({
  selector: 'app-klub-listing',
  standalone: true,
  imports: [
    RouterModule,
    BadgeModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PaginatorModule,
    ReactiveFormsModule,
    TableModule,
    KlubInfosComponent,
    MultiSelectModule,
    KlubFiltersComponent,
    FormsModule,
    ListLoadingNoResultsComponent,
    ListHeaderComponent,
    KlubStatusComponent,
    KlubDocsCompletionComponent,
    KlubInfosCompletionComponent,
    ValidatedInfoComponent,
    TooltipModule,
    NgClass,
    CurrencyPipe,
    Tag,
    DatePipe,
    LastUpdatedAtPipe,
    Drawer,


  ],
  templateUrl: './klub-listing.component.html',
  styles: `
    .layout-main {
      width: 100% !important;
    }

    .app-table {
      thead {
        tr {
          th:first-child {
            position: sticky;
            left: 0;
            background: var(--white);
          }
        }
      }

      tbody {
        tr {
          td:first-child {
            position: sticky;
            left: 0;
            background: var(--white);
          }
        }
      }
    }
  `,
  encapsulation: ViewEncapsulation.None,
})
export class KlubListingComponent extends GenericListingComponent<Klubr, KlubFilters> {
  /* SPECIFIC SERVICES */
  public klubrService = inject(KlubrService);
  public deviceService = inject(DeviceService);
  protected pdfService = inject(PdfService);
  public confirmDialogWrapperService = inject(ConfirmDialogWrapperService);

  /* SPECIFIC VAR */
  public showActions: WritableSignal<boolean> = signal<boolean>(false);
  public selectedClub = signal<Klubr | undefined>(undefined);

  /* COL SELECTION */
  public colFiltersOptions = Object.values(COL_FILTERS_LIST_VALUES);
  public colFiltersOptionsGrouped = [
    {
      label: 'Statut',
      value: 'status',
      items: this.colFiltersOptions.slice(0, 1),
    },
    {
      label: 'Sport / Région',
      value: 'sportRegion',
      items: this.colFiltersOptions.slice(1, 4),
    },
    {
      label: 'Statistiques',
      value: 'stats',
      items: this.colFiltersOptions.slice(4, 7),
    },
    {
      label: 'Complétion',
      value: 'completion',
      items: this.colFiltersOptions.slice(7, 10),
    },
    {
      label: 'Documents',
      value: 'documents',
      items: this.colFiltersOptions.slice(10, 15),
    }
  ];
  public selectedColFilters = signal(
    this.colFiltersOptions.map(option => option.value)
  );
  public selectedCol = computed(() => {
    return this.colFiltersOptions.filter(option => this.selectedColFilters()?.findIndex((val) => val === option.value) !== -1);
  })

  /* OVERRIDED METHODDS */
  protected override requestListWithFilters(klubUuid?: string | null, filters?: KlubFilters, page = 1): Observable<ApiListResult<Klubr>> {
    return this.klubrService.getKlubsWithFilters(filters, defaultKlubrForAdminPopulate, 'withNbProjects=true&withNbActiveProjects=true&withNbDons=true&withNbMembers=true', defaultKlubrSort, untracked(this.page), untracked(this.pageSize));
  }

  redirectToKlubWebSitePage(klubSlug: string) {
    window.open(`${this.webSiteUrl}/${klubSlug}`, '_blank');
  }

  public readonly COL_FILTERS_LIST_VALUES = COL_FILTERS_LIST_VALUES;
  public readonly webSiteUrl = environment.nextJsUrl;

  /* SPECIFIC METHODS */
  toggleShowActions(club: Klubr): void {
    this.selectedClub.set(club);
    this.showActions.update((val) => !val);
  }

  connectAs(klubr: Klubr) {
    this.confirmDialogWrapperService.confirm({
      message: `Voulez-vous vous connecter en tant qu'administrateur de ${klubr.denomination}?`,
      header: `Connection en tant qu'administrateur`,
      acceptLabel: 'Valider',
      accept: () => {
        this.sharedFacade.switchToProfileAdminEditor(klubr.uuid);
      },
    });

  }
}
