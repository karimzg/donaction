import { ElementRef, Injectable } from '@angular/core';
import { MapGeocoder, MapGeocoderResponse } from '@angular/google-maps';
import { iif, Observable, of, switchMap } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { GoogleMapsApiService } from './google-maps-api.service';
import PlaceResult = google.maps.places.PlaceResult;

@Injectable()
export class GoogleMapsUtilsService {

  constructor(
    private readonly geocoder: MapGeocoder,
    private readonly googleMapsApiService: GoogleMapsApiService,
  ) {
  }

  /*
  * GEOLOCATE
  * */
  geolocateMe(): Observable<PlaceResult | null> {
    if (navigator.geolocation) {
      return this.getLocation().pipe(
        switchMap((position: GeolocationPosition) => {
          return iif(
            () => !!position,
            this.googleMapsApiService.googleApiLoaded$.pipe(
              filter((loaded) => loaded),
              switchMap(() => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                return this.geocoder.geocode({location: {lat, lng}})
              }),
              map((mapGeocoderResponse: MapGeocoderResponse) => {
                console.log('>>>> geoCoder', mapGeocoderResponse);
                if (mapGeocoderResponse.status === 'OK') {
                  if (mapGeocoderResponse.results[5]) {
                    return mapGeocoderResponse.results[5] as PlaceResult;
                  } else {
                    console.error('No results found');
                    return null;
                  }
                } else {
                  console.error('Geocoder failed due to: ' + mapGeocoderResponse.status);
                  throw new Error('Geocoder failed due to: ' + mapGeocoderResponse.status);
                }
              })
            ),
            of(null),
          )
        }),
      )
    } else {
      alert("Geolocation is not supported by this browser.");
      throw new Error('Geolocation is not supported by this browser.');
    }
  }

  /*
  * GET GEOLOCATION AS OBSERVABLE
  * */
  getLocation(): Observable<GeolocationPosition> {
    return new Observable(obs => {
      navigator.geolocation.getCurrentPosition(
        success => {
          obs.next(success);
          obs.complete();
        },
        error => {
          obs.error(error);
        }
      );
    });
  }

  geoCode(address: string) {
    this.geocoder.geocode({
      address,
    }).pipe(
      tap((result) => console.log('>>> geoCode', result))
    ).subscribe();
  }

  /*
  * GET PLACE AUTOCOMPLETE
  * */
  getPlaceAutocomplete(element: ElementRef, types = [] /*['(regions)']*/): Observable<PlaceResult> {
    const options = {
      componentRestrictions: {
        country: ['FR']
      },
      types
    };
    const autocomplete = new google.maps.places.Autocomplete(element.nativeElement, options);
    return this.getPlaceChanged(autocomplete);
  }

  /*
  * GET PLACE CHANGED AS OBS
  * */
  getPlaceChanged(autocomplete: any): Observable<PlaceResult> {
    return new Observable(obs => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
          obs.next(autocomplete.getPlace());
        },
      );
    });
  }

  getAddrComponent(place: any, componentTemplate: any): any {
    if (!place.address_components) {
      return '';
    }
    let result;
    for (const component of place.address_components) {
      const addressType = component.types[0];
      if (componentTemplate[addressType]) {
        result = component[componentTemplate[addressType]];
        return result;
      }
    }
    return '';
  }

  getStreetNumber(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    const COMPONENT_TEMPLATE = {street_number: 'short_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getStreet(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    const COMPONENT_TEMPLATE = {route: 'long_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getAddress(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    const streetNumber = this.getStreetNumber(place);
    const street = this.getStreet(place);
    return street || streetNumber ? `${this.getStreetNumber(place)} ${this.getStreet(place)}` : '';
  }

  getCity(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    const COMPONENT_TEMPLATE = {locality: 'long_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getState(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    const COMPONENT_TEMPLATE = {administrative_area_level_1: 'short_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getDistrict(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    const COMPONENT_TEMPLATE = {
      administrative_area_level_2:
        'short_name'
    };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCountryShort(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    const COMPONENT_TEMPLATE = {country: 'short_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCountry(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    const COMPONENT_TEMPLATE = {country: 'long_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getPostCode(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    const COMPONENT_TEMPLATE = {postal_code: 'long_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getWebSite(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    return place.website || '';
  }

  getPhone(place?: PlaceResult): string {
    if (!place) {
      return '';
    }
    return place.formatted_phone_number || '';
  }
}
