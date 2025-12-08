import { Pipe, PipeTransform } from '@angular/core';
import { Invoice, InvoiceLine } from "@shared/utils/models/invoice";
import { KlubProject } from "@shared/utils/models/klubr";

@Pipe({
  name: 'invoiceProjectsList',
  standalone: true
})
export class InvoiceProjectsListPipe implements PipeTransform {

  transform(invoice: Invoice): string {
    if (invoice.invoice_lines) {
      const projects = invoice.invoice_lines.filter((line: InvoiceLine) => line.klub_projet)?.map((line: InvoiceLine) => line.klub_projet);
      if ((projects?.length || 0) > 0) {
        let result = ``;
        result += projects
          .filter((project): project is KlubProject => project !== undefined)
          .map((project: KlubProject) => `${project.titre}<br>`)?.join('');
        return result;
      }
      return '';
    }
    return '';
  }

}
