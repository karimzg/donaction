import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  Renderer2,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { Dimensions, ImageCroppedEvent, ImageCropperComponent, ImageTransform, LoadedImage } from "ngx-image-cropper";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { SliderModule } from "primeng/slider";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Message } from 'primeng/message';

@Component({
    selector: 'app-image-cropper-dialog',
    imports: [
        ImageCropperComponent,
        FormsModule,
        ButtonModule,
        TooltipModule,
        SliderModule,
        Message,
    ],
    templateUrl: './image-cropper-dialog.component.html',
    styles: `
    :root {
      --cropper-outline-color: rgba(255, 255, 255, 0.8);
    }

    .image-cropper-dialog-component {
      display: flex;
      flex-direction: column;
    }
  `,
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'image-cropper-dialog-component',
    }
})
export class ImageCropperDialogComponent implements AfterViewInit {
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);

  /* IMAGE VARIABLES */
  imageChangedEvent = signal<any | null>(null);
  croppedImageBlob = signal<Blob | undefined>(undefined);
  croppedImageObjectUrl = signal<string | undefined>('');
  imageURL = signal<string | null>(null);

  /* STATES VARIABLES */
  loading = signal(false);
  disableCrop = signal(false);

  /* TRANSFORMATIONS VARIABLES */
  allowMoveImage = signal(false);
  canvasRotation = signal(0);
  transform = signal<ImageTransform>({
    translateUnit: 'px'
  });
  rotation?: number;
  translateH = 0;
  translateV = 0;
  scale = 1;
  aspectRatio = signal(1);
  cropperMinWidth = signal(1220);
  resizeToWidth = signal(2440);
  // availableRatios = [
  //   {label: '1:1', value: 1 / 1},
  //   {label: '4:3', value: 4 / 3},
  //   {label: '16:9', value: 16 / 9}
  // ];

  /* SIZE VARIABLES */
  sourceImageWidth: number | undefined;
  sourceImageHeight: number | undefined;
  cropperMaxWidth = 500;
  cropperMaxHeight = 500;
  sliderValue = signal(0);
  containWithinAspectRatio = signal(false);
  minScale = 1;
  maxSliderValue = 3;
  isReady = signal(false);

  /* MISC VARIABLES */
  alertMsg = signal<Array<{ severity: string, text: string }> | undefined>(undefined);

  constructor() {
    /* UPDATE FOOTER COMPONENT STATES */
    effect(() => {
      this.config.data.loading.next(this.loading());
      this.config.data.disableCrop.next(this.disableCrop());
    });
    if (this.config.data.image) {
      /* GET INPUT VARIABLES */
      this.aspectRatio.update((ar) => this.config.data.aspectRatio || ar);
      this.cropperMinWidth.update((ar) => this.config.data.cropperMinWidth || ar);
      this.resizeToWidth.update((ar) => this.config.data.resizeToWidth || ar);

      /* HANDLE EVENT FROM FOOTER COMPONENT */
      this.config.data.resetImageClicked.pipe(takeUntilDestroyed()).subscribe(() => this.resetImage());
      this.config.data.cropImageClicked.pipe(takeUntilDestroyed()).subscribe(() => this.cropImage());
      this.config.data.useOriginalImageClicked.pipe(takeUntilDestroyed()).subscribe(() => this.useOriginalImage());

      /* LOAD IMAGE */
      this.loading.set(true);
      const file = this.config.data.image;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageURL.set(e.target.result); // Create a data URL
        this.imageChangedEvent.set({
          target: {
            files: [file]
          }
        });
        this.loading.set(false);
      };
      reader.readAsDataURL(file);
    }
  }

  ngAfterViewInit() {
    this.isReady.set(true);
  }

  /* IMAGE METHODS */
  imageCropped(event: ImageCroppedEvent) {
    console.log('Cropped Image Event:', event);
    if (event.objectUrl) {
      this.croppedImageObjectUrl.set(event.objectUrl);
    }
    this.croppedImageBlob.set(event.blob!);
  }

  imageLoaded(loadedImage: LoadedImage) {
    this.alertMsg.set(undefined);
    const sizeRatioWidth = loadedImage.original.size.width / this.cropperMinWidth();
    if (sizeRatioWidth < 1) {
      if (sizeRatioWidth < 0.8) {
        this.disableCrop.set(true);
      }
      this.alertMsg.update((msg) => [
        ...(msg || []),
        {
          severity: sizeRatioWidth < 0.8 ? 'error' : 'warn',
          text: `La résolution de l'image est ${sizeRatioWidth < 0.8 ? 'beaucoup ' : ''}trop faible. La largeur minimale recommandée est de ${this.cropperMinWidth()}px.\n La largeur actuelle est de ${loadedImage.original.size.width}px.`,
        }
      ]);
    }
    const cropperMinHeight = this.cropperMinWidth() / this.aspectRatio();
    const sizeRatioHeight = loadedImage.original.size.height / cropperMinHeight;
    if (sizeRatioHeight < 1) {
      if (sizeRatioHeight < 0.8) {
        this.disableCrop.set(true);
      }
      this.alertMsg.update((msg) => [
        ...(msg || []),
        {
          severity: sizeRatioHeight < 0.8 ? 'error' : 'warn',
          text: `La résolution de l'image est ${sizeRatioHeight < 0.8 ? 'beaucoup ' : ''}trop faible. La hauteur minimale recommandée est de ${cropperMinHeight}px.\n La hauteur actuelle est de ${loadedImage.original.size.height}px.`,
        }
      ]);
    }
  }

  loadImageFailed() {
    console.error('Load image failed');
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    this.loading.set(false);
    this.sourceImageWidth = sourceImageDimensions.width;
    this.sourceImageHeight = sourceImageDimensions.height;
    this.calculateMinScale();
    this.initializeSlider();
  }

  /* IMAGE TRANSFORMATIONS */
  rotateLeft() {
    this.loading.set(true);
    this.canvasRotation.update((c) => --c);
    console.log('Canvas Rotation:', this.canvasRotation());
    this.flipAfterRotate();
  }

  rotateRight() {
    this.loading.set(true);
    this.canvasRotation.update((c) => ++c);
    console.log('Canvas Rotation:', this.canvasRotation());
    this.flipAfterRotate();
  }

  moveLeft() {
    this.transform.update((t) => ({...t, translateH: ++this.translateH}));
  }

  moveRight() {
    this.transform.update((t) => ({...t, translateH: --this.translateH}));
  }

  moveTop() {
    this.transform.update((t) => ({...t, translateV: ++this.translateV}));
  }

  moveBottom() {
    this.transform.update((t) => ({...t, translateV: --this.translateV}));
  }

  private flipAfterRotate() {
    this.transform.update((t) => ({...t, flipH: this.transform().flipV, flipV: this.transform().flipH}));
    this.translateH = 0;
    this.translateV = 0;
    this.loading.set(false);
  }

  flipHorizontal() {
    this.transform.update((t) => ({...t, flipH: !t.flipH}));
  }

  flipVertical() {
    this.transform.update((t) => ({...t, flipV: !t.flipV}));
  }

  /* IMAGE RESET */
  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation.set(0);
    this.transform.set({
      translateUnit: 'px'
    });
    this.allowMoveImage.set(false);  // Reset to false when image is reset
    this.sliderValue.set(0);
  }

  initializeSlider() {
    if (this.sourceImageWidth && this.sourceImageHeight) {
      this.scale = Math.max(
        this.cropperMaxWidth / this.sourceImageWidth,
        this.cropperMaxHeight / this.sourceImageHeight
      );
      this.zoomChanged();
    }
  }

  calculateMinScale() {
    if (this.sourceImageWidth && this.sourceImageHeight) {
      this.minScale = Math.max(
        this.cropperMaxWidth / this.sourceImageWidth,
        this.cropperMaxHeight / this.sourceImageHeight
      );
    }
  }

  /* ZOOM METHODS */
  zoomChanged() {
    const zoomFactor = 0.5; // Define how much each step in the slider changes the zoom
    this.sliderValue.set(Math.min(Math.max(this.sliderValue(), -1.8), this.maxSliderValue)); // Ensure slider value is within bounds
    this.scale = 1 + this.sliderValue() * zoomFactor; // Map slider value to zoom scale
    this.transform.update((t) => ({...t, scale: this.scale}));
    this.allowMoveImage.set(this.sliderValue() > 0); // Enable moving image when zoomed in
  }

  toggleAllowMove() {
    this.allowMoveImage.update((ami) => !ami);
  }

  onMouseWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.2 : 0.2;
    this.sliderValue.update((v) => v + delta);
    this.sliderValue.set(Math.min(Math.max(this.sliderValue(), -1.8), this.maxSliderValue)); // Ensure the slider value doesn't go out of bounds
    this.zoomChanged();
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio.update((cwar) => !cwar);
    this.cropperInactive();
  }

  cropperInactive() {
    const divElement = this.el.nativeElement.querySelector('.ngx-ic-cropper');
    if (this.containWithinAspectRatio()) {
      this.renderer.removeClass(divElement, 'ngx-ic-cropper-active');
    } else {
      this.renderer.addClass(divElement, 'ngx-ic-cropper-active');
    }
  }

  /* UNUSED */
  updateRotation() {
    this.transform.update((t) => ({...t, rotate: this.rotation}));
  }

  // toggleAspectRatio() {
  //   this.aspectRatio = this.aspectRatio === 4 / 3 ? 16 / 5 : 4 / 3;
  // }

  /* OUTPUT */
  cropImage() {
    this.ref.close({
      action: 'crop',
      blob: this.croppedImageBlob(),
      croppedImageObjectUrl: this.croppedImageObjectUrl()
    });
  }

  useOriginalImage() {
    this.ref.close({
      action: 'useOriginal',
    });
  }

}


