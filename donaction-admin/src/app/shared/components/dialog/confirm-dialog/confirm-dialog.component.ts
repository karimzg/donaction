import { Component, inject } from '@angular/core';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { ConfirmDialogWrapperService } from "@shared/components/dialog/confirm-dialog/confirm-dialog-wrapper.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ButtonModule } from "primeng/button";
import { ConfirmationWrapper } from "@shared/components/dialog/confirm-dialog/confirm-dialog.model";
import { Message } from "primeng/message";

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    ConfirmDialogModule,
    ButtonModule,
    Message,
  ],
  providers: [ConfirmationService],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  public confirmationService = inject(ConfirmationService);
  private confirmationWrapperService = inject(ConfirmDialogWrapperService);
  confirmation: ConfirmationWrapper | undefined;

  constructor() {
    this.confirmationWrapperService.confirmationSubject.pipe(
      takeUntilDestroyed(),
    ).subscribe({
      next: (confirmation) => {
        this.confirmation = confirmation
        this.confirmationService.confirm(confirmation)
      }
    })
  }

  confirm() {
    this.confirmation?.accept?.()
    this.confirmationService.close()
  }

  reject() {
    this.confirmation?.reject?.()
    this.confirmationService.close()
  }
}
