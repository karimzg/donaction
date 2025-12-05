import { booleanAttribute, Component, inject, input, signal, WritableSignal } from '@angular/core';
import { DonationDetails, DonationPayment } from "@shared/utils/models/donation-details";
import { Drawer } from "primeng/drawer";
import { RouterLink } from "@angular/router";
import { PdfService } from "@shared/services/pdf.service";
import { PermissionsService } from "@shared/services/permissions.service";
import { environment } from "@environments/environment";

@Component({
  selector: 'app-don-actions',
  imports: [
    Drawer,
    RouterLink,
  ],
  templateUrl: './don-actions.component.html',
})
export class DonActionsComponent {
  protected pdfService = inject(PdfService);
  protected permissionsService = inject(PermissionsService);

  private readonly stripeUrl = environment.STRIPE_PAYMENT_LINK;

  donation = input<DonationDetails | undefined>(undefined);
  donationPayment = input<DonationPayment | undefined>(undefined);
  showDetailLink = input(false, {transform: booleanAttribute});
  userIsDonationOwner = input<boolean>(false);
  contribUuid = input<string>();

  public showActions: WritableSignal<boolean> = signal<boolean>(false);

  toggleShowActions(): void {
    this.showActions.update((val) => !val);
  }

  stripeLink(paymentIntent: string): void {
    window.open(`${this.stripeUrl}${paymentIntent}`, '_blank');
  }
}
