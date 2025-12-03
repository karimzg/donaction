import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Button } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
    selector: 'app-document-validation-modal',
    imports: [
        Button,
        DialogModule,
    ],
    templateUrl: './document-validation-modal.component.html'
})
export class DocumentValidationModalComponent {
  public ref = inject(DynamicDialogRef);
  public message: WritableSignal<string> = signal<string>('Vous allez modifier le statut de ce document.');

}
