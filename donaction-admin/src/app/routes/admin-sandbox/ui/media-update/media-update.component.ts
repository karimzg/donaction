import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ButtonDirective } from "primeng/button";
import { FileUploadModule } from "primeng/fileupload";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { TOKEN_NAME } from "@shared/utils/config/global-settings";
import { CookieService } from "ngx-cookie-service";
import { PermissionsService } from "@shared/services/permissions.service";
import { CommonModule } from "@angular/common";
import { ToastService } from "@shared/services/misc/toast.service";
import { environment } from "@environments/environment";

@Component({
  selector: 'app-media-update',
  imports: [
    CommonModule,
    ButtonDirective,
    FileUploadModule
  ],
  templateUrl: './media-update.component.html',
  styleUrl: './media-update.component.scss',
  host: {'class': 'card block'}
})
export class MediaUpdateComponent {
  protected cookieService = inject(CookieService);
  protected http = inject(HttpClient);
  protected permissionsService = inject(PermissionsService);
  protected toastService = inject(ToastService);
  protected readonly destroyRef = inject(DestroyRef);

  itemUUID: InputSignal<string> = input<string>('', {alias: 'itemUUID'});
  mediaField: InputSignal<string> = input<string>('logo', {alias: 'mediaField'});
  itemMediaLabel: InputSignal<string> = input<string>('Logo');
  endpointPrefix: InputSignal<string> = input<string>('medias/klubr/');
  endpointSuffix: InputSignal<string> = input<string>('/files');
  fileInput: InputSignal<any> = input<any | undefined>();
  mediaPreviewWidth: InputSignal<number> = input<number>(2);
  allowVideo: InputSignal<boolean> = input<boolean>(false);

  onItemLoaded: OutputEmitterRef<any> = output();

  public endpoint: Array<Signal<string>> = [
    computed(() => environment.apiUrl + this.endpointPrefix() + this.itemUUID() + this.endpointSuffix()),
  ];
  public files: Array<WritableSignal<Array<any>>> = (new Array(2)).fill(signal<Array<any>>([]));
  public headers = toSignal(this.permissionsService.roleChanged$.pipe(
    map(() => new HttpHeaders({
      'Authorization': 'Bearer ' + this.cookieService.get(TOKEN_NAME),
    }))
  ));

  constructor() {
    effect(() => {
      if (this.fileInput()) {
        this.files[0].set([this.fileInput()]);
      }
    });
  }

  public onUpload(event: any, index = 0) {
    const fileList = [];
    for (const file of event.files) {
      fileList.push(file);
    }
    this.files[index].set(fileList);
    console.log('UPLOAD', this.files[index]());
    // this.getItemMedia(this.itemUUID()!).subscribe();
    this.onItemLoaded.emit(true);

    this.toastService.showSuccessToast('Succès', 'Fichier téléchargé');
  }

  public onProgress(event: any) {
    console.log('PROGRESS', event);
  }

  public onSelectionChange(event: any) {
    console.log('onSelectionChang', event);
    // this.files = [];
  }

  public onError(event: any) {
    console.log('ERROR', event)
    this.toastService.showErrorToast('Erreur', 'Erreur lors du téléchargement du fichier');
  }

  public removeMedia(file: any, index = 0) {
    this.files[index].set(this.files[index]().filter((f) => f.name !== file.name));
  }

}
