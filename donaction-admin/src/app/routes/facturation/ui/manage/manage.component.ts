import { Component, inject, input, InputSignal, untracked, ViewEncapsulation } from '@angular/core';
import { CheckboxModule } from "primeng/checkbox";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DatePipe, Location } from "@angular/common";
import { AvatarModule } from "primeng/avatar";
import { TableModule } from "primeng/table";
import { ApiListResult } from "@shared/utils/models/misc";
import { defaultInvoicePopulate, defaultInvoiceSort, InvoiceService } from "@shared/services/entities/invoice.service";
import { PaginatorModule } from "primeng/paginator";
import { KlubInfosComponent } from "@shared/components/klub/klub-infos/klub-infos.component";
import { Invoice } from "@shared/utils/models/invoice";
import { DownloadInvoiceComponent } from "@shared/components/invoice/download-invoice/download-invoice.component";
import {
  SendByMailInvoiceComponent
} from "@shared/components/invoice/send-by-mail-invoice/send-by-mail-invoice.component";
import { InvoiceNbProjectsPipe } from "@shared/pipes/invoice/invoice-nb-project/invoice-nb-projects.pipe";
import { TooltipModule } from "primeng/tooltip";
import { InvoiceProjectsListPipe } from "@shared/pipes/invoice/invoice-projects-list/invoice-projects-list.pipe";
import { fadeAnimation, flipAnimation } from "@shared/utils/animations/animations";
import { SelectButtonModule } from "primeng/selectbutton";
import { InvoiceFilters } from "../../model/invoice-filters";
import { InputTextModule } from "primeng/inputtext";
import { GenericListingComponent } from "@shared/components/generics/generic-listing/generic-listing.component";
import { Observable } from "rxjs";
import { ListHeaderComponent } from "@shared/components/lists/list-header/list-header.component";
import { InvoiceFiltersComponent } from "@app/routes/facturation/ui/invoice-filters/invoice-filters.component";
import {
  ListLoadingNoResultsComponent
} from "@shared/components/lists/list-loading-no-results/list-loading-no-results.component";
import { Klubr } from "@shared/utils/models/klubr";

@Component({
  selector: 'app-manage',
  imports: [
    CheckboxModule,
    FormsModule,
    AvatarModule,
    DatePipe,
    TableModule,
    PaginatorModule,
    ReactiveFormsModule,
    KlubInfosComponent,
    DownloadInvoiceComponent,
    SendByMailInvoiceComponent,
    InvoiceNbProjectsPipe,
    TooltipModule,
    InvoiceProjectsListPipe,
    SelectButtonModule,
    InputTextModule,
    ListHeaderComponent,
    InvoiceFiltersComponent,
    ListLoadingNoResultsComponent,
  ],
  animations: [flipAnimation, fadeAnimation],
  templateUrl: './manage.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ManageComponent extends GenericListingComponent<Invoice, InvoiceFilters> {
  /* SPECIFIC SERVICES */
  private location = inject(Location);
  private invoiceService = inject(InvoiceService);

  /* SPECIFIC VARS */
  public klubrInit: InputSignal<Klubr | undefined> = input<Klubr | undefined>(undefined);

  ngOnInit() {
    const urlWithoutQueryParam = this.location.path().split('?')[0];
    this.location.replaceState(urlWithoutQueryParam);

    /* SET INPUT FILTERS */
    this.setInputFilters();
  }

  setInputFilters(): void {
    const filters: InvoiceFilters = {
      billingPeriodSmall: undefined,
      klubrUUIDs: null,
      searchParams: undefined,
      invoicePdfPath: null,
      firstSentEmailDate: null,
    };
    if (this.klubrInit()?.uuid) {
      filters['klubrUUIDs'] = [this.klubrInit()!.uuid!];
    }
    if (Object.keys(filters).length) {
      this.filtersList.set(filters);
    }
  }

  /* OVERRIDED METHODDS */
  protected override requestListWithFilters(klubUuid?: string | null, filters?: InvoiceFilters, page = 1): Observable<ApiListResult<Invoice>> {
    return this.invoiceService.getInvoices(filters, defaultInvoicePopulate, undefined, defaultInvoiceSort, untracked(this.page), untracked(this.pageSize));
  }
}
