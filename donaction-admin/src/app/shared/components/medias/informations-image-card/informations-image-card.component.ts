import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  OnInit,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { environment } from "@environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { downloadPDF, openPDFInNewWindow } from "@shared/utils/helpers/pdf-helpers";
import { NgClass, NgTemplateOutlet } from "@angular/common";
import { CachingService } from "@shared/services/caching.service";
import { LottieComponent } from "ngx-lottie";
import { DialogModule } from 'primeng/dialog';
import { VideoReaderComponent } from "../video-reader/video-reader.component";
import { slugify } from "@shared/utils/helpers/query-helpers";
import { catchError, switchMap, take, tap } from "rxjs/operators";
import { merge, NEVER } from "rxjs";
import { FormMediaUpdateComponent } from "../../form/form-media-update/form-media-update.component";
import { FormControl, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Button } from "primeng/button";
import { RouterLink } from "@angular/router";
import { TooltipModule } from "primeng/tooltip";
import { AnalyticsService } from "@shared/services/analytics/analytics.service";

@Component({
  selector: 'app-informations-image-card',
  imports: [
    NgClass,
    LottieComponent,
    DialogModule,
    VideoReaderComponent,
    FormMediaUpdateComponent,
    Button,
    RouterLink,
    NgTemplateOutlet,
    TooltipModule,
  ],
  templateUrl: './informations-image-card.component.html',
  styles: `
    @media screen and (max-width: 640px) {
      .informations-image-card {
        width: 100%;
      }
    }
  `,
  host: {
    class: 'informations-image-card'
  },
  encapsulation: ViewEncapsulation.None
})
export class InformationsImageCardComponent implements OnInit {
  private http = inject(HttpClient);
  private cachingService = inject(CachingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly analyticsService = inject(AnalyticsService);
  public description: InputSignal<string | undefined> = input<string | undefined>('');
  public endpointPrefix: InputSignal<string> = input<string>('');
  public uuid: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public klubUuid: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public inputImageUrl: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public isImage: InputSignal<boolean> = input<boolean>(false);
  public imageUrl: WritableSignal<string | undefined> = signal(undefined);
  public isImageLoading: WritableSignal<boolean> = signal<boolean>(true);
  public isVideo: InputSignal<boolean> = input<boolean>(false);
  public staticPDF: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public error: WritableSignal<boolean> = signal<boolean>(false);
  public errorMsg: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  public isPlaying: boolean = false;
  public showUploadPoster: WritableSignal<boolean> = signal<boolean>(false);

  // posterMedia
  mediaUpload = viewChild.required<FormMediaUpdateComponent>('mediaUpload');
  public control = new FormControl(undefined, Validators.required)
  public isLoading: WritableSignal<boolean> = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.uuid()) {
        this.setImage().pipe(
          takeUntilDestroyed(this.destroyRef),
        ).subscribe();
      } else {
        if (this.inputImageUrl()) {
          this.imageUrl.set(this.inputImageUrl());
        } else {
          this.imageUrl.set(undefined);
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.isVideo()) {
      this.generateVideoPreview();
    }
  }

  public setImage() {
    const endpoint = environment.apiUrl + this.endpointPrefix() + '/' + this.uuid() + '/poster-pdf?asImage=true';
    const headers = new HttpHeaders({
      'Content-Type': 'image/jpeg'
    });
    const request = this.http.get(endpoint, {headers: headers, responseType: 'blob'}).pipe(
      catchError((error) => {
        if ((error.status === 400 || error.status === 500)) {
          this.error.set(true);
          this.errorMsg.set(error.message);
        }
        return NEVER;
      })
    );
    return this.cachingService.cacheObservable<any>(endpoint, request).pipe(
      tap((response) => {
        const image = new Blob([response], {type: 'image/jpeg'});
        this.imageUrl.set(URL.createObjectURL(image));
      })
    );
  }

  private unvalidateCache() {
    this.cachingService.clearCacheKey(environment.apiUrl + this.endpointPrefix() + '/' + this.uuid() + '/poster-pdf?asImage=true');
  }

  public pdfAction(action: 'open' | 'download') {
    if (untracked(this.isImage) && untracked(this.imageUrl) && !untracked(this.staticPDF)) {
      if (action === 'open') {
        window.open(untracked(this.inputImageUrl));
        this.analyticsService.trackEvent('FileEvent', {customProps: {Action: `OpenImg - IMG: ${untracked(this.description)}`}});
      } else {
        const link = document.createElement('a');
        link.href = untracked(this.inputImageUrl) || '';
        link.download = 'file.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.analyticsService.trackEvent('FileEvent', {customProps: {Action: `DownloadImg - IMG: ${untracked(this.description)}`}});
      }
    } else if (untracked(this.staticPDF)) {
      if (action === 'open') {
        window.open(untracked(this.staticPDF));
      } else {
        const link = document.createElement('a');
        link.href = untracked(this.staticPDF) || '';
        link.download = 'file.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      this.analyticsService.trackEvent('FileEvent', {customProps: {Action: `OpenPdf - PDF: ${untracked(this.description)}`}});
    } else {
      const endpoint = environment.apiUrl + untracked(this.endpointPrefix) + '/' + untracked(this.uuid) + '/poster-pdf';
      const headers = new HttpHeaders({
        'Content-Type': 'application/pdf'
      });
      const request = this.http.get(endpoint, {headers: headers, responseType: 'blob', observe: 'response'});
      this.cachingService.cacheObservable<any>(endpoint, request).pipe(
        action === 'open' ? openPDFInNewWindow() : downloadPDF('affiche-' + slugify(untracked(this.description) || 'file') + '.pdf')
      ).subscribe();
      this.analyticsService.trackEvent('FileEvent', {customProps: {Action: `DownloadPdf - PDF: ${untracked(this.description)}`}});
    }
  }

  public downloadVideo() {
    const link = document.createElement('a');
    link.href = this.imageUrl() || '';
    link.download = 'video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.analyticsService.trackEvent('FileEvent', {customProps: {Action: `DownloadVideo - VIDEO: ${untracked(this.description)}`}});
  }

  public toggleVideo() {
    this.isPlaying = !this.isPlaying;
  }

  private generateVideoPreview() {
    if (!this.inputImageUrl()) {
      this.imageUrl.set('assets/images/placeholders/placeholder-klubr.svg');
      this.isImageLoading.set(false);
    }
    const video = document.createElement('video');
    video.src = this.inputImageUrl() || '';
    video.addEventListener('loadeddata', () => {
      video.currentTime = 1;
    });
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log('canvas', canvas);
        this.imageUrl.set(canvas.toDataURL('image/jpeg'));
        this.isImageLoading.set(false);
      }
    });
  }

  public updateFile(): void {
    if (this.control?.dirty) {
      this.isLoading.set(true);
      this.mediaUpload().uploadFile();
      merge(
        this.mediaUpload().onItemLoaded$.pipe(
          take(1),
          tap(() => {
            this.unvalidateCache();
            this.isImageLoading.set(true);
            this.error.set(false);
            this.showUploadPoster.set(false);
          }),
          switchMap(() => this.setImage()),
          tap(() => this.analyticsService.trackEvent('FileEvent', {customProps: {Action: `UpdatePoster: ${untracked(this.description)}`}})),
        ),
        this.mediaUpload().onItemErrorLoaded$.pipe(),
      ).pipe(
      ).subscribe({
        complete: () => {
          this.isLoading.set(false);
        }
      });
    }
  }
}
