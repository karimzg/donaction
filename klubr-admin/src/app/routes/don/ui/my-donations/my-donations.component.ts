import { Component, inject, untracked } from '@angular/core';
import { BadgeModule } from "primeng/badge";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { ReactiveFormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { DonationDetails } from "@shared/utils/models/donation-details";
import { ApiListResult } from "@shared/utils/models/misc";
import { KlubInfosComponent } from "@shared/components/klub/klub-infos/klub-infos.component";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { DonateurInfosComponent } from "@shared/components/donateur/donateur-infos/donateur-infos.component";
import { StatusDonBodyPipe } from "@shared/pipes/dons/status-don-body.pipe";
import { DownloadPdfComponent } from "@shared/components/medias/download-pdf/download-pdf.component";
import { DonationService } from "@shared/services/donation-service.service";
import {
  ListLoadingNoResultsComponent
} from "@shared/components/lists/list-loading-no-results/list-loading-no-results.component";
import { GenericListingComponent } from "@shared/components/generics/generic-listing/generic-listing.component";
import { DonFilters } from "@app/routes/don/model/don-filters";
import { Observable } from "rxjs";
import { fadeAnimation } from "@shared/utils/animations/animations";
import { DeviceService } from "@shared/services/device.service";
import { Tag } from "primeng/tag";
import { RouterLink } from "@angular/router";
import { TooltipModule } from "primeng/tooltip";
import { DonActionsComponent } from "@app/routes/don/ui/mobile-actions/don-actions/don-actions.component";

@Component({
  selector: 'app-my-donations',
  standalone: true,
  imports: [
    BadgeModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PaginatorModule,
    ReactiveFormsModule,
    TableModule,
    KlubInfosComponent,
    DatePipe,
    DonateurInfosComponent,
    StatusDonBodyPipe,
    DownloadPdfComponent,
    ListLoadingNoResultsComponent,
    Tag,
    RouterLink,
    CurrencyPipe,
    TooltipModule,
    DonActionsComponent,
  ],
  templateUrl: './my-donations.component.html',
  styleUrl: './my-donations.component.scss',
  animations: [fadeAnimation]
})
export class MyDonationsComponent extends GenericListingComponent<DonationDetails, DonFilters> {
  /* SPECIFIC SERVICES */
  protected donationService = inject(DonationService);
  protected deviceService = inject(DeviceService);

  /* OVERRIDED METHODS */
  protected override requestListWithFilters(klubUuid?: string | null, filters?: DonFilters, page = 1): Observable<ApiListResult<DonationDetails>> {
    return this.donationService.getMyDon(
      untracked(this.page),
      untracked(this.pageSize),
    );
  }

}
