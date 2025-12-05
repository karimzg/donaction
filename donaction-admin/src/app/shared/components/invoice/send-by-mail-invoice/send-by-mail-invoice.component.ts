import { Component, inject, input, output, signal } from '@angular/core';
import { Invoice } from "@shared/utils/models/invoice";
import { InvoiceService } from "@shared/services/entities/invoice.service";
import { ToastService } from "@shared/services/misc/toast.service";
import { ConfirmDialogWrapperService } from "@shared/components/dialog/confirm-dialog/confirm-dialog-wrapper.service";
import { ToastModule } from "primeng/toast";

@Component({
  selector: 'app-send-by-mail-invoice',
  imports: [
    ToastModule,
  ],
  providers: [ToastService],
  templateUrl: './send-by-mail-invoice.component.html',
  styles: `
    button {
      border: none;
      background: none;
      cursor: pointer;
    }
  `
})
export class SendByMailInvoiceComponent {
  private invoiceService = inject(InvoiceService);
  public confirmDialogWrapperService = inject(ConfirmDialogWrapperService);
  private toastService = inject(ToastService);

  invoice = input<Invoice>();
  isLoading = signal(false);
  emailSent = output();

  sendInvoice() {
    if (this.invoice()) {
      this.confirmDialogWrapperService.confirm({
        message: `Confirmez-vous la facture aux dirigeants du klub ?`,
        header: `Envoi de la facture par mail`,
        accept: () => {
          this.isLoading.set(true);
          this.invoiceService.sendInvoice(this.invoice()!.uuid).subscribe({
            next: (result) => {
              this.isLoading.set(false);
              if (result.length === 0) {
                this.toastService.showWarnToast('Envoi de facture', 'Aucun dirigeant n\'a été trouvé pour ce klub, ou aucun dirigeant est opt-in pour recevoir les factures par mail');
                return;
              } else {
                this.emailSent.emit();
                this.toastService.showSuccessToast('Facture envoyée', `La facture a été envoyée avec succès à ${result.map((dir) => `${dir.fullName} (${dir.email})`).join(', ')}`);
              }
            },
            error: (error) => {
              this.toastService.showErrorToast('Erreur', error.message);
              this.isLoading.set(false);
            },
          });
        },
      });
    }
  }
}
