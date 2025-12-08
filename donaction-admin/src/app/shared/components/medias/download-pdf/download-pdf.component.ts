import { Component, inject, input, InputSignal } from '@angular/core';
import { Popover } from "primeng/popover";
import { PdfService } from "@shared/services/pdf.service";
import { PermissionsService } from "@shared/services/permissions.service";

@Component({
  selector: 'app-download-pdf',
  imports: [
    Popover,
  ],
  templateUrl: './download-pdf.component.html',
  styleUrl: './download-pdf.component.scss'
})
export class DownloadPdfComponent {
  pdfService = inject(PdfService);
  permissionsService = inject(PermissionsService);
  uuid: InputSignal<string> = input.required<string>();
  uuidContribution: InputSignal<string | undefined> = input<string | undefined>(undefined);
  uuidOriginal: InputSignal<string | undefined> = input<string | undefined>(undefined);
  withTaxReduction: InputSignal<boolean> = input<boolean>(false);
  isButton: InputSignal<boolean> = input<boolean>(false);
  onlyRecu: InputSignal<boolean> = input<boolean>(false);
  showOp: boolean = false;
  hideTimeOut: any;

  constructor() {
  }

  getPdf(acc: number, uuid: string): void {
    this.pdfService.getPdf(acc, uuid);
  }

  onHover(event: MouseEvent, op: Popover) {
    clearTimeout(this.hideTimeOut);
    op.show(event);
    if (op.container) {
      console.log('op.container', op.container);
      op.align();
    }
    this.showOp = true;
  }

  onLeave(op: Popover) {
    this.hideTimeOut = setTimeout(() => {
      op.hide();
    }, 100);
  }

  onOverlayEnter() {
    clearTimeout(this.hideTimeOut);
    this.showOp = true;
  }

  onOverlayLeave(op: Popover) {
    this.showOp = false;
    this.onLeave(op);
  }

  protected readonly Image = Image;
}
