import {
  Component,
  inject,
  input,
  InputSignal,
  model,
  signal,
  untracked,
  ViewEncapsulation,
  WritableSignal,
} from '@angular/core';
import { ImageModule } from 'primeng/image';
import {
  defaultDonSort,
  defaultDonWithAvatarPopulate,
  DonationService
} from '@shared/services/donation-service.service';
import { CurrencyPipe, DatePipe, Location, NgOptimizedImage } from '@angular/common';
import { DonationDetails, STATUS_PAYMENT } from '@shared/utils/models/donation-details';
import { TableModule } from 'primeng/table';
import { StyleClassModule } from 'primeng/styleclass';
import { AvatarModule } from 'primeng/avatar';
import { DownloadPdfComponent } from '@shared/components/medias/download-pdf/download-pdf.component';
import { DonFilters } from "../../model/don-filters";
import { DonateurInfosComponent } from "@shared/components/donateur/donateur-infos/donateur-infos.component";
import { ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { StatusDonBodyPipe } from "@shared/pipes/dons/status-don-body.pipe";
import { ApiListResult } from "@shared/utils/models/misc";
import { PaginatorModule } from "primeng/paginator";
import { BadgeModule } from "primeng/badge";
import { KlubInfosComponent } from "@shared/components/klub/klub-infos/klub-infos.component";
import { TagModule } from "primeng/tag";
import { GenericListingComponent } from "@shared/components/generics/generic-listing/generic-listing.component";
import { Observable } from "rxjs";
import {
  ListLoadingNoResultsComponent
} from "@shared/components/lists/list-loading-no-results/list-loading-no-results.component";
import { ListHeaderComponent } from "@shared/components/lists/list-header/list-header.component";
import { KlubProject, Klubr } from "@shared/utils/models/klubr";
import { Invoice } from "@shared/utils/models/invoice";
import { DonFiltersComponent } from "@app/routes/don/ui/don-filters/don-filters.component";
import { fadeAnimation } from "@shared/utils/animations/animations";
import { DeviceService } from "@shared/services/device.service";
import { PdfService } from "@shared/services/pdf.service";
import { RouterLink } from "@angular/router";
import { Tooltip } from "primeng/tooltip";
import { DonActionsComponent } from "@app/routes/don/ui/mobile-actions/don-actions/don-actions.component";

@Component({
  selector: 'app-don-listing',
  imports: [
    ImageModule,
    DatePipe,
    TableModule,
    StyleClassModule,
    AvatarModule,
    DownloadPdfComponent,
    DonateurInfosComponent,
    ReactiveFormsModule,
    InputTextModule,
    StatusDonBodyPipe,
    PaginatorModule,
    BadgeModule,
    KlubInfosComponent,
    TagModule,
    ListLoadingNoResultsComponent,
    ListHeaderComponent,
    DonFiltersComponent,
    DonActionsComponent,
    RouterLink,
    CurrencyPipe,
    Tooltip,
    NgOptimizedImage,
  ],
  templateUrl: './don-listing.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [fadeAnimation]
})
export class DonListingComponent extends GenericListingComponent<DonationDetails, DonFilters> {
  /* SPECIFIC SERVICES */
  private location = inject(Location);
  private donationService = inject(DonationService);
  protected deviceService = inject(DeviceService);
  protected pdfService = inject(PdfService);

  /* SPECIFIC VARS */
  public klubrInit: InputSignal<Klubr | undefined> = input<Klubr | undefined>(undefined);
  public projectInit: WritableSignal<KlubProject | undefined> = model<KlubProject | undefined>(undefined);
  public miscProjectInit: WritableSignal<boolean> = signal<boolean>(false);
  public invoiceInit: WritableSignal<Invoice | undefined> = model<Invoice | undefined>(undefined);
  public miscInvoiceInit: WritableSignal<boolean> = signal<boolean>(false);
  public donationStatusInit: InputSignal<{ label: string, code: STATUS_PAYMENT } | undefined> = input<{
    label: string,
    code: STATUS_PAYMENT
  } | undefined>(undefined);
  public donationDateInit: InputSignal<(string | undefined)[] | undefined> = input<(string | undefined)[] | undefined>(undefined);

  ngOnInit() {
    const urlWithoutQueryParam = this.location.path().split('?')[0];
    this.location.replaceState(urlWithoutQueryParam);

    /* SET INPUT FILTERS */
    this.setInputFilters();
  }

  setInputFilters(): void {
    const filters: { [key: string]: Array<string | null> } = {};
    if (this.klubrInit()?.uuid) {
      filters['klubrUUIDs'] = [this.klubrInit()!.uuid!];
    }
    if (this.projectInit() !== undefined) {
      if (this.projectInit()?.uuid) {
        filters['klubProject'] = [this.projectInit()!.uuid!];
      } else {
        filters['klubProject'] = [null];
      }
    }
    if (this.invoiceInit() !== undefined) {
      if (this.invoiceInit()?.uuid) {
        filters['invoice'] = [this.invoiceInit()!.uuid!];
      } else {
        filters['invoice'] = [null];
      }
    }
    if (this.donationStatusInit()) {
      filters['donationStatus'] = [this.donationStatusInit()?.code!];
    }
    if (this.donationDateInit()) {
      if (this.donationDateInit()![0] !== undefined && this.donationDateInit()![1] !== undefined) {
        filters['donationDate'] = [this.donationDateInit()![0]!, this.donationDateInit()![1]!];
      }
    }
    if (Object.keys(filters).length) {
      this.filtersList.set(filters);
    }
    if (this.projectInit() !== undefined) {
      if (!this.projectInit()?.uuid) {
        this.miscProjectInit.set(true);
      }
    }
    if (this.invoiceInit() !== undefined) {
      if (!this.invoiceInit()?.uuid) {
        this.miscInvoiceInit.set(true);
      }
    }
  }

  /* OVERRIDED METHODDS */
  protected override requestListWithFilters(klubUuid?: string | null, filters?: DonFilters, page = 1): Observable<ApiListResult<DonationDetails>> {
    return this.donationService.getDonWithFilters(
      filters,
      [
        ...defaultDonWithAvatarPopulate
        , ...(untracked(this.permissionsService.memberIsAtLeastLeaderSignal) ? ['invoice'] : [])
        , ...(untracked(this.permissionsService.memberIsAdminSignal) ? ['klub_don_contribution', 'klub_don'] : [])
      ],
      undefined,
      defaultDonSort,
      untracked(this.page),
      untracked(this.pageSize)
    );
  }

}
