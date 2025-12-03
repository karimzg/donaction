import { Component, inject, input, OnInit, signal, WritableSignal } from '@angular/core';
import { DonationDetails } from "@shared/utils/models/donation-details";
import { DownloadPdfComponent } from "@shared/components/medias/download-pdf/download-pdf.component";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { KlubInfosComponent } from "@shared/components/klub/klub-infos/klub-infos.component";
import { CurrencyPipe, DatePipe, NgClass, NgOptimizedImage } from "@angular/common";
import { StatusDonBodyPipe } from "@shared/pipes/dons/status-don-body.pipe";
import { Tag } from "primeng/tag";
import { DonateurInfosComponent } from "@shared/components/donateur/donateur-infos/donateur-infos.component";
import { PermissionsService } from "@shared/services/permissions.service";
import { StatusDonPaymentPipe } from "@shared/pipes/dons/status-don-payment.pipe";
import { DeviceService } from "@shared/services/device.service";
import { environment } from "@environments/environment";
import { SortPipe } from "@shared/pipes/misc/sort.pipe";
import { Tooltip } from "primeng/tooltip";
import { ActivatedRoute } from "@angular/router";
import { DonActionsComponent } from "@app/routes/don/ui/mobile-actions/don-actions/don-actions.component";

@Component({
  selector: 'app-details',
  imports: [
    DownloadPdfComponent,
    BreadcrumbModule,
    KlubInfosComponent,
    DatePipe,
    NgClass,
    StatusDonBodyPipe,
    Tag,
    DonateurInfosComponent,
    StatusDonPaymentPipe,
    CurrencyPipe,
    SortPipe,
    NgOptimizedImage,
    Tooltip,
    DonActionsComponent,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  public permissionsService = inject(PermissionsService);
  public deviceService = inject(DeviceService);
  public activatedRoute = inject(ActivatedRoute);
  private readonly stripeUrl = environment.STRIPE_PAYMENT_LINK;

  public donation = input<DonationDetails | undefined>(undefined);
  public showActions: WritableSignal<boolean> = signal<boolean>(false);

  public isFromMyDonations = signal<boolean>(false);
  public contribUuid = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.isFromMyDonations.set(this.activatedRoute.snapshot.queryParams['mes-dons'] || false);
    this.contribUuid.set(this.activatedRoute.snapshot.queryParams['contribUuid'] || undefined);
  }

  stripeLink(paymentIntent: string): void {
    window.open(`${this.stripeUrl}${paymentIntent}`, '_blank');
  }
}
