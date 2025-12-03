import { Component, inject, signal, WritableSignal } from '@angular/core';
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { Router } from "@angular/router";
import { DialogModule } from "primeng/dialog";
import { DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-please-complete-klub-modal',
  imports: [
    DialogModule,
  ],
  templateUrl: './please-complete-klub-modal.component.html',
  styleUrl: './please-complete-klub-modal.component.scss'
})
export class PleaseCompleteKlubModalComponent {
  public sharedFacade = inject(SharedFacade);
  private router = inject(Router);
  public ref = inject(DynamicDialogRef);

  public showContactDialog: WritableSignal<boolean> = signal<boolean>(false);

  public toggleContactDialog(): void {
    this.showContactDialog.set(!this.showContactDialog());
  }

  handleDialogState($event: undefined | boolean) {
    if ($event !== undefined) {
      this.showContactDialog.set($event);
    }
  }

  link(routerLink: Array<string>) {
    this.router.navigate(routerLink);
    this.ref.close();
  }
}
