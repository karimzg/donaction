import { Pipe, PipeTransform } from '@angular/core';
import { Invoice, InvoiceLine } from "@shared/utils/models/invoice";

@Pipe({
  name: 'invoiceNbProjects',
  standalone: true
})
export class InvoiceNbProjectsPipe implements PipeTransform {

  transform(invoice: Invoice): number {
    return (invoice.invoice_lines)
      ? invoice.invoice_lines.filter((line: InvoiceLine) => line.klub_projet).length
      : 0;
  }

}
