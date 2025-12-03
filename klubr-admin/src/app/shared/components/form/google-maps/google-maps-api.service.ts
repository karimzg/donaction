import { Inject, Injectable, LOCALE_ID, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, iif, Observable, of, switchMap } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsApiService {

  private googleApiURL = 'https://maps.googleapis.com/maps/api/js';
  private googleApiKey = environment.GOOGLE_MAPS_API_KEY;
  private librairies = ['places'];

  private _googleApiLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public googleApiLoaded$: Observable<boolean> = this._googleApiLoaded$.asObservable().pipe(
    filter(() => isPlatformBrowser(this.platformId)),
    switchMap((loaded) =>
      iif(
        () => !loaded,
        this.httpClient.jsonp(`${this.googleApiURL}?key=${this.googleApiKey}&language=${this.language}&libraries=${this.librairies.join(',')}`, 'callback')
          .pipe(
            tap(() => this._googleApiLoaded$.next(true)),
            map(() => true),
            catchError((err) => {
              console.error('error', err);
              return of(false);
            }),
          ),
        of(true)
      )
    )
  );

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    @Inject(LOCALE_ID) private readonly language: string,
    private readonly httpClient: HttpClient,
  ) {
  }
}
