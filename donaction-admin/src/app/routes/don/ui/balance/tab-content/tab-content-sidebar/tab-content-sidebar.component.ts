import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  untracked,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { ISideBar } from "@shared/utils/models/tabContent";
import { CurrencyPipe, DatePipe, NgClass, NgIf, NgOptimizedImage } from "@angular/common";
import { ImageModule } from "primeng/image";
import { TableModule } from "primeng/table";
import { LottieComponent } from "ngx-lottie";
import { TapContentSidebarTitlePipe } from "./pipe/tap-content-sidebar-title.pipe";
import { DonationDetails } from "@shared/utils/models/donation-details";
import { Invoice, InvoiceLineReference } from "@shared/utils/models/invoice";
import { defaultDonSort, DonationService } from "@shared/services/donation-service.service";
import { tap } from "rxjs/operators";
import { ApiListResult, MetaPagination } from "@shared/utils/models/misc";
import { DonateurInfosComponent } from "@shared/components/donateur/donateur-infos/donateur-infos.component";
import { PaginatorModule } from "primeng/paginator";
import { Button } from "primeng/button";
import { CachingService } from "@shared/services/caching.service";
import { InvoiceService } from "@shared/services/entities/invoice.service";
import { TooltipModule } from "primeng/tooltip";
import { InputTextModule } from "primeng/inputtext";
import { DrawerModule } from "primeng/drawer";
import { Tag } from "primeng/tag";

@Component({
  selector: 'app-tab-content-sidebar',
  imports: [
    DrawerModule,
    NgIf,
    NgClass,
    ImageModule,
    DatePipe,
    TableModule,
    LottieComponent,
    TapContentSidebarTitlePipe,
    CurrencyPipe,
    DonateurInfosComponent,
    PaginatorModule,
    Button,
    NgOptimizedImage,
    TooltipModule,
    InputTextModule,
    Tag,
  ],
  templateUrl: './tab-content-sidebar.component.html',
  styleUrl: './tab-content-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TabContentSidebarComponent implements OnInit {
  private readonly donationService = inject(DonationService);
  private readonly cachingService = inject(CachingService);
  private readonly invoiceService = inject(InvoiceService);
  public SIDEBAR: InputSignal<ISideBar> = input<ISideBar>({context: 'CLUB'})
  onCloseSideBar: OutputEmitterRef<void> = output();
  public donationList: WritableSignal<ApiListResult<DonationDetails> | undefined> = signal<ApiListResult<DonationDetails> | undefined>(undefined);
  public totalAmount: WritableSignal<number> = signal<number>(0);
  public isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public paginationEnabled: WritableSignal<boolean> = signal<boolean>(false);
  public pagination: WritableSignal<MetaPagination | undefined> = signal(undefined);
  public page: WritableSignal<number> = signal(1);
  public pageSize: WritableSignal<number> = signal(20);
  // Invoices
  public creditLines: WritableSignal<Array<{ project: string; date: Date; amount: number }>> = signal([]);
  public debitLines: WritableSignal<Array<{
    ref: string;
    quantity: number;
    unitPrice: number;
    amount: number
  }>> = signal([]);
  public totalCreditLines: WritableSignal<number> = signal<number>(0);
  public totalDeditLines: WritableSignal<number> = signal<number>(0);
  public invoice: Signal<Invoice | undefined> = computed(() => this.SIDEBAR().content!.contextObject!.invoice);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    // TODO: set COLD DATA
    switch (this.SIDEBAR().context) {
      case "CLUB":
        if (this.SIDEBAR().content!.contextObject?.type === 'notBilledDonations' && this.SIDEBAR().content!.contextObject?.donations) {
          this.donationList.set(this.SIDEBAR().content!.contextObject!.donations as ApiListResult<DonationDetails>);
          this.totalAmount.set((this.SIDEBAR().content!.contextData.filter((data) => data.reference === 'totalAmount')[0].value as number) || 0);
        } else if (this.SIDEBAR().content!.contextObject?.type === 'invoice' && this.SIDEBAR().content!.contextObject!.invoice) {
          const invoiceLineUuid = this.SIDEBAR().content!.contextObject!.invoice!.invoice_lines.find((line) => line.reference === InvoiceLineReference.DONATION_CLUB)?.uuid;
          if (invoiceLineUuid) {
            this.isLoading.set(true);
            this.totalAmount.set(this.SIDEBAR().content!.contextObject!.invoice!.creditTotalAmount);
            let request = this.donationService.getDonWithFilters({
              invoiceLineUuid,
              donationStatus: 'success'
            }, undefined, undefined, defaultDonSort, untracked(this.page), untracked(this.pageSize));
            if (this.SIDEBAR().content!.contextObject!.coldData) {
              request = this.cachingService.cacheObservable<ApiListResult<DonationDetails>>(`invoice-line-donations-${invoiceLineUuid}-page${untracked(this.page)}`, request);
            }
            request.pipe(
              tap((donations) => {
                this.donationList.update((donationList) => ({
                  data: [...(donationList?.data || []), ...donations.data],
                  meta: donations.meta
                }));
                this.paginationEnabled.set(donations.meta.pagination.pageCount > 1);
                this.pagination.set(donations.meta.pagination);
              })
            ).subscribe(() => {
              this.isLoading.set(false);
            });
          }
        }
        console.log('SIDEBAR', this.SIDEBAR());
        break;
      case "PROJETS":
        console.log('SIDEBAR', this.SIDEBAR());
        const projectUuid = this.SIDEBAR().content!.contextObject!.project?.uuid;
        let request = this.donationService.getDonWithFilters({
          klubProject: [projectUuid!],
          donationStatus: 'success'
        }, undefined, undefined, defaultDonSort, untracked(this.page), untracked(this.pageSize));
        if (this.SIDEBAR().content!.contextObject!.coldData) {
          request = this.cachingService.cacheObservable<ApiListResult<DonationDetails>>(`project-line-donations-${projectUuid}-page${untracked(this.page)}`, request);
        }
        request.pipe(
          tap((donations) => {
            this.donationList.update((donationList) => ({
              data: [...(donationList?.data || []), ...donations.data],
              meta: donations.meta
            }));
            this.paginationEnabled.set(donations.meta.pagination.pageCount > 1);
            this.pagination.set(donations.meta.pagination);
          })
        ).subscribe(() => {
          this.isLoading.set(false);
        });
        break;
      case "FACTURES":
        console.log('SIDEBAR', untracked(this.SIDEBAR));
        const invoice = this.SIDEBAR().content!.contextObject!.invoice;
        if (!invoice) {
          return;
        }
        const creditInvoiceLines = invoice.invoice_lines.filter((line) => line.isCreditLine);
        const debitInvoiceLines = invoice.invoice_lines.filter((line) => !line.isCreditLine);
        this.totalCreditLines.set(creditInvoiceLines.reduce((acc, line) => acc + line.amountExcludingTax, 0));
        this.totalDeditLines.set(debitInvoiceLines.reduce((acc, line) => acc + line.amountExcludingTax, 0));
        this.creditLines.set(creditInvoiceLines.map((line) => ({
          project: line.reference === InvoiceLineReference.DONATION_CLUB ? 'Fonctionnement du Klub' : line.klub_projet?.titre || '',
          date: line.reference === InvoiceLineReference.DONATION_CLUB ? new Date() : line.klub_projet?.dateLimiteFinancementProjet || new Date(),
          amount: line.amountExcludingTax
        })));
        this.debitLines.set(debitInvoiceLines.map((line) => ({
          ref: line.reference + ' | ' + line.description,
          quantity: line.quantity,
          unitPrice: line.unitPriceExcludingTax,
          amount: line.amountExcludingTax
        })));
        this.totalAmount.set(invoice.amountExcludingTax);
        break;
      default:
        break;
    }
  }

  changePage(page: number) {
    this.page.set(page);
    this.loadData();
  }

  downloadInvoice(invoice: Invoice) {
    if (invoice) {
      this.invoiceService.downloadInvoice(invoice.uuid, invoice.invoiceNumber);
    }
  }

}
