import { Pipe, PipeTransform } from '@angular/core';
import { donPaymentStatus } from "@shared/utils/helpers/donation-status";
import { DonationPayment } from "@shared/utils/models/donation-details";
import { Severity } from "@shared/utils/models/misc";

@Pipe({
  name: 'statusDonPayment'
})
export class StatusDonPaymentPipe implements PipeTransform {
  transform(status: DonationPayment, ...args: unknown[]): {
    text: string;
    color: string,
    severity: Severity
  } {
    return donPaymentStatus(status);
  }

}
