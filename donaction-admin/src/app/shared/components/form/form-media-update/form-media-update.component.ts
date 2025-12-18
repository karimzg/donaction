import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  OnInit,
  output,
  Signal,
  signal,
  untracked,
  ViewChild,
  ViewEncapsulation,
  WritableSignal,
} from '@angular/core';
import { FileUpload } from "primeng/fileupload";
import { outputToObservable, toSignal } from "@angular/core/rxjs-interop";
import { delay, map, take } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";
import { environment } from "@environments/environment";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { PermissionsService } from "@shared/services/permissions.service";
import { TOKEN_NAME } from "@shared/utils/config/global-settings";
import { ToastService } from "@shared/services/misc/toast.service";
import { FileSizePipe } from "@shared/pipes/media/file-size.pipe";
import { ValidatedInfoComponent } from "../../atoms/validated-info/validated-info.component";
import { DialogService } from "primeng/dynamicdialog";
import { DialogModule } from "primeng/dialog";
import { ImageCropperDialogComponent } from "../../medias/image-cropper-dialog/image-cropper-dialog.component";
import {
  ImageCropperDialogFooterComponent
} from "../../medias/image-cropper-dialog/image-cropper-dialog-footer/image-cropper-dialog-footer.component";
import { BehaviorSubject, of, Subject } from "rxjs";
import { ButtonModule } from "primeng/button";

@Component({
  selector: 'app-form-media-update',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUpload,
    FileSizePipe,
    ValidatedInfoComponent,
    DialogModule,
    ButtonModule,
  ],
  providers: [
    DialogService,
  ],
  templateUrl: './form-media-update.component.html',
  styleUrl: './form-media-update.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.has-value]': 'safeUrl() || control()?.value',
  }
})
export class FormMediaUpdateComponent implements OnInit {
  protected cookieService = inject(CookieService);
  protected http = inject(HttpClient);
  protected permissionsService = inject(PermissionsService);
  protected toastService = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  private dialogService = inject(DialogService);

  itemUUID: InputSignal<string> = input<string>('', {alias: 'itemUUID'});
  mediaField: InputSignal<string> = input<string>('logo', {alias: 'mediaField'});
  itemMediaLabel: InputSignal<string> = input<string>('Logo');
  endpointPrefix: InputSignal<string> = input<string>('medias/klubr/');
  endpointSuffix: InputSignal<string> = input<string>('/files');
  control = input.required<FormControl>();
  mediaPreviewWidth: InputSignal<number> = input<number>(2);
  size: InputSignal<'sm' | 'md' | 'lg'> = input<'sm' | 'md' | 'lg'>('lg');
  fileTypesAllowed: InputSignal<Array<MediaType>> = input<Array<MediaType>>(['img']);
  fileTypes: Signal<string> = computed(() =>
    this.fileTypesAllowed().map((type) => type === 'img' ? 'image/*' : (type === 'video' ? 'video/*' : 'application/*')).join(',')
  );
  allowVideo = computed(() => this.fileTypesAllowed().includes('video'));
  disabled: InputSignal<boolean> = input<boolean>(false);
  progress: WritableSignal<number> = signal<number>(0);
  initFile: WritableSignal<File | undefined> = signal(undefined);
  initControlValue: WritableSignal<string | undefined> = signal(undefined);
  mediaType: ModelSignal<'img' | 'video' | 'doc'> = model<'img' | 'video' | 'doc'>('img');
  validatedDocument = input<boolean | undefined>(undefined);
  dynamicZoneId = signal<string>('');

  // hasvalue = output<boolean>();
  onItemLoaded = output<boolean>();
  onItemLoaded$ = outputToObservable(this.onItemLoaded);
  onItemErrorLoaded = output<boolean>();
  onItemErrorLoaded$ = outputToObservable(this.onItemErrorLoaded);
  onReset = output();
  onDownloadFile = output<string>();
  onValidatedClick = output<void>();

  // Cropper
  activateCropperForImg = input(false, {transform: booleanAttribute});
  customUpload = signal(false);
  customUploadBlob = signal<Blob | undefined>(undefined);
  aspectRatio = input(16 / 9);
  cropperMinWidth = input(1220);
  resizeToWidth = input(2440);

  public endpoint: Array<Signal<string>> = [
    computed(() => environment.apiUrl + this.endpointPrefix() + this.itemUUID() + this.endpointSuffix() + this.dynamicZoneId()),
  ];
  public files: Array<WritableSignal<Array<any>>> = (new Array(2)).fill(signal<Array<any>>([]));
  public headers = toSignal(this.permissionsService.roleChanged$.pipe(
    map(() => new HttpHeaders({
      'Authorization': 'Bearer ' + this.cookieService.get(TOKEN_NAME),
    }))
  ));
  public safeUrl: WritableSignal<SafeUrl | undefined> = signal<SafeUrl | undefined>(undefined);
  public loading: WritableSignal<boolean> = signal<boolean>(false);

  @ViewChild(FileUpload) fileUploadComponent!: FileUpload;

  constructor() {
    // effect(() => {
    //   console.log('SAFE URL', this.safeUrl());
    //   console.log('CONTROL VALUE', this.control()?.value);
    //   this.hasvalue.emit(!!this.safeUrl() || this.control()?.value);
    // });
  }

  ngOnInit() {
    this.initControlValue.set(this.control().value);
  }

  public setInitFile(file: any) {
    this.initFile.set(file);
    this.fileUploadComponent.files = [file];
    this.setSelection(file);
  }

  public onUpload(event?: any, index = 0) {
    const fileList = [];
    if (event?.files) {
      for (const file of event?.files) {
        fileList.push(file);
      }
    }
    this.files[index].set(fileList);
    this.onItemLoaded.emit(true);
    this.loading.set(false);
    this.control().markAsPristine();
    this.toastService.showSuccessToast('Succès', 'Fichier téléchargé');
  }

  public onProgress(event: any) {
    this.progress.set(event.progress);
  }

  /* CROPPER */

  public onSelectionChange(event: any) {
    const file = event.files[0];
    this.mediaType.set(file.type?.startsWith('video') ? 'video' : (file.type?.startsWith('application') ? 'doc' : 'img'));
    if (this.activateCropperForImg() && this.mediaType() === 'img') {
      const ref = this.dialogService.open(ImageCropperDialogComponent, {
        header: 'Ajuster l\'image',
        width: '75rem',
        modal: true,
        contentStyle: {overflow: 'auto', display: 'flex', justifyContent: 'center'},
        styleClass: 'footer-border',
        breakpoints: {
          '1199px': '75vw',
          '575px': '90vw'
        },
        data: {
          image: file,
          aspectRatio: this.aspectRatio(),
          cropperMinWidth: this.cropperMinWidth(),
          resizeToWidth: this.resizeToWidth(),
          resetImageClicked: new Subject<void>(),
          cropImageClicked: new Subject<void>(),
          useOriginalImageClicked: new Subject<void>(),
          disableCrop: new BehaviorSubject<boolean>(false),
          loading: new BehaviorSubject<boolean>(false),
        },
        templates: {
          footer: ImageCropperDialogFooterComponent,
        },
      });
      ref?.onClose.pipe(
        take(1),
      ).subscribe((response: {
        action: 'crop' | 'cancel' | 'useOriginal',
        blob?: Blob,
        croppedImageObjectUrl?: string
      }) => {
        console.log('RESPONSE', response);
        switch (response?.action) {
          case 'crop':
            this.customUpload.set(true);
            this.customUploadBlob.set(response.blob);
            this.setSelection(undefined, response.croppedImageObjectUrl);
            break;
          case 'useOriginal':
            this.customUpload.set(false);
            this.setSelection(event.currentFiles[0]);
            break;
          case 'cancel':
          default:
            this.customUpload.set(false);
            this.reset();
            break;
        }
      });

    } else {
      this.customUpload.set(false);
      this.setSelection(event.currentFiles[0]);
    }
  }

  onBeforeUpload(event: any) {
    console.log('BEFORE UPLOAD', event);
  }

  /* Upload handler dor media coming from image-cropper-dialog */
  onUploadHandler(event: any) {
    if (this.customUploadBlob()) {
      console.log('onUploadHandler', event);
      const formData = new FormData();
      formData.append(this.mediaField(), this.customUploadBlob()!);

      this.http.post(
        `${this.endpoint[0]()}`,
        formData,
        {headers: this.headers()}
      ).subscribe({
        next: () => {
          this.onUpload()
        },
        error: err => {
          this.onError(err)
        }
      });
    }
  }

  private setSelection(file: any, fileUrl?: string) {
    if (file?.type) {
      this.mediaType.set(file.type?.startsWith('video') ? 'video' : (file.type?.startsWith('application') ? 'doc' : 'img'));
    }
    if (this.mediaType() === 'video') {
      const videoUrl = URL.createObjectURL(file);
      this.safeUrl.set(this.sanitizer.bypassSecurityTrustUrl(videoUrl));
      this.control().patchValue(this.safeUrl());
    } else if (this.mediaType() === 'img') {
      if (fileUrl) {
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustUrl(fileUrl));
      } else {
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustUrl(file.objectURL.changingThisBreaksApplicationSecurity));
      }
      this.control().patchValue(this.safeUrl());
    } else if (this.mediaType() === 'doc') {
      this.control().patchValue(file);
    }
    this.control().markAsDirty();
  }

  // private setSelection(file: any) {
  //   if (file?.type) {
  //     this.isVideo.set(file.type?.startsWith('video'));
  //     if (this.isVideo()) {
  //       const videoUrl = URL.createObjectURL(file);
  //       this.safeUrl.set(this.sanitizer.bypassSecurityTrustUrl(videoUrl));
  //     } else {
  //       this.safeUrl.set(this.sanitizer.bypassSecurityTrustUrl(file.objectURL.changingThisBreaksApplicationSecurity));
  //     }
  //     this.control().patchValue(this.safeUrl());
  //     this.control().markAsDirty();
  //   }
  // }

  public choose(event: any, callback: any) {
    callback();
  }

  public onError(event?: any) {
    console.log('ERROR', event);
    this.loading.set(false);
    this.onItemErrorLoaded.emit(true);
    this.toastService.showErrorToast('Erreur', 'Erreur lors du téléchargement du fichier');
  }

  public onRemove(file: any, index = 0) {
    this.files[index].set(this.files[index]().filter((f) => f.name !== file.name));
  }

  /* ACTIONS */
  public reset(callback?: any) {
    if (this.control().dirty) {
      this.onReset.emit();
      this.control().setValue(untracked(this.initControlValue));
      this.control().markAsPristine();
      this.safeUrl.set(undefined);
      if (callback) {
        callback();
      }
    }
  }

  uploadFile(dynamicZoneId?: string) {
    if (dynamicZoneId) {
      this.dynamicZoneId.set(dynamicZoneId);
    }
    this.loading.set(true);
    // Required to add a delay to ensure the dynamicZoneId is properly taken into account.
    of(true).pipe(
      delay(100),
      take(1),
    ).subscribe(() => {
      this.fileUploadComponent.upload();
    });
  }
}

export type MediaType = 'img' | 'video' | 'doc';
