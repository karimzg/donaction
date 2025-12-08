import { Component, inject } from '@angular/core';
import { BehaviorSubject, Subject } from "rxjs";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { AsyncPipe } from "@angular/common";
import { TooltipModule } from "primeng/tooltip";
import { ButtonModule } from "primeng/button";

@Component({
  selector: 'app-image-cropper-dialog-footer',
  imports: [
    AsyncPipe,
    TooltipModule,
    ButtonModule,
  ],
  template: `
    <div class="footer flex gap-2 sm:gap-3 mt-4 justify-between sm:justify-end">
      <p-button label="Annuler" class="self-end" severity="secondary" (click)="closeAndReset()"
                pTooltip="Annuler et retourner à l'écran précédent" tooltipPosition="top"
                [disabled]="loading | async"/>
      <p-button label="Réinitialiser l'image" class="self-end p-button--only-icon-mobile" severity="primary"
                icon="pi pi-sync"
                pTooltip="Réinitialiser les réglages initiaux" tooltipPosition="top"
                (click)="resetImage()"
                [disabled]="(loading | async) || (disableCrop | async)"/>
      <p-button label="Recadrer" class="self-end p-button--only-icon-mobile" severity="contrast"
                icon="pi pi-arrow-down-left-and-arrow-up-right-to-center"
                pTooltip="Recadrer l'image" tooltipPosition="top"
                [loading]="loading | async" [disabled]="(loading | async) || (disableCrop | async)"
                (click)="cropImage()"/>
      <p-button label="Image originale" class="self-end p-button--only-icon-mobile" severity="contrast"
                icon="pi pi-check"
                pTooltip="Utiliser l'image originale" tooltipPosition="top"
                [loading]="loading | async" [disabled]="(loading | async) || (disableCrop | async)"
                (click)="useOriginalImage()"/>
    </div>`,
  styles: ``
})
export class ImageCropperDialogFooterComponent {
  protected ref = inject(DynamicDialogRef);
  protected config = inject(DynamicDialogConfig);


  protected resetImageClicked: Subject<void> = new Subject<void>();
  protected cropImageClicked: Subject<void> = new Subject<void>();
  protected useOriginalImageClicked: Subject<void> = new Subject<void>();
  protected disableCrop: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  protected loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.resetImageClicked = this.config.data.resetImageClicked;
    this.cropImageClicked = this.config.data.cropImageClicked;
    this.useOriginalImageClicked = this.config.data.useOriginalImageClicked;
    this.disableCrop = this.config.data.disableCrop;
    this.loading = this.config.data.loading;
  }

  resetImage() {
    this.resetImageClicked.next();
  }

  cropImage() {
    this.cropImageClicked.next();
  }

  useOriginalImage() {
    this.useOriginalImageClicked.next();
  }

  closeAndReset() {
    this.ref.close();
  }
}
