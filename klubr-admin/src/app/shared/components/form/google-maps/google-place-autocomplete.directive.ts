import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';
import { GoogleMapsApiService } from './google-maps-api.service';
import { filter, switchMap, tap } from 'rxjs/operators';
import { GoogleMapsUtilsService } from './google-maps-utils.service';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import PlaceResult = google.maps.places.PlaceResult;

@Directive({
  selector: '[appGooglePlaceAutocomplete]',
  standalone: false
})
export class GooglePlaceAutocompleteDirective {

  @Output() onSelect: EventEmitter<PlaceResult> = new EventEmitter();

  // @ts-ignore
  private element: HTMLInputElement;

  constructor(
    private readonly elRef: ElementRef,
    private readonly googleMapsApiService: GoogleMapsApiService,
    private readonly googleMapsUtilsService: GoogleMapsUtilsService,
  ) {
    this.element = elRef.nativeElement;
    this.googleMapsApiService.googleApiLoaded$.pipe(
      takeUntilDestroyed(),
      filter((loaded) => loaded),
      switchMap(() => this.googleMapsUtilsService.getPlaceAutocomplete(this.elRef)),
      tap((result) => this.onSelect.emit(result))
    ).subscribe();
  }
}
