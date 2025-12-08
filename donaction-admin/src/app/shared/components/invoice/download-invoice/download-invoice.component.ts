import { Component, inject, input, output } from '@angular/core';
import { Invoice } from "@shared/utils/models/invoice";
import { InvoiceService } from "@shared/services/entities/invoice.service";

@Component({
  selector: 'app-download-invoice',
  imports: [],
  templateUrl: './download-invoice.component.html',
  styles: `
    button {
      border: none;
      background: none;
      cursor: pointer;
    }
  `
})
export class DownloadInvoiceComponent {
  private invoiceService = inject(InvoiceService);
  invoice = input<Invoice>();
  invoiceDownloaded = output();

  downloadInvoice() {
    if (this.invoice()) {
      this.invoiceService.downloadInvoice(this.invoice()!.uuid, this.invoice()!.invoiceNumber);
      this.invoiceDownloaded.emit();
    }
  }
}
