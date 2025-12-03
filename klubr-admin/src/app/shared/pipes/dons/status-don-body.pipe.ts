import { Pipe, PipeTransform } from '@angular/core';
import { DonationDetails } from "@shared/utils/models/donation-details";
import { statusBodyTemplate } from "@shared/utils/helpers/donation-status";
import { Severity } from "@shared/utils/models/misc";

@Pipe({
  name: 'statusDonBody',
  standalone: true
})
export class StatusDonBodyPipe implements PipeTransform {
  transform(status: DonationDetails, ...args: unknown[]): {
    text: string;
    color: string,
    severity: Severity
  } {
    return statusBodyTemplate(status);
  }

}
