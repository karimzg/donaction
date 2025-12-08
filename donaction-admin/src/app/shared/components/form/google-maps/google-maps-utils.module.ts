import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsUtilsService } from './google-maps-utils.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { GooglePlaceAutocompleteDirective } from './google-place-autocomplete.directive';

@NgModule({
  declarations: [
    GooglePlaceAutocompleteDirective,
  ],
  imports: [
    CommonModule,
    GoogleMapsModule,
  ],
  exports: [
    GoogleMapsModule,
    GooglePlaceAutocompleteDirective,
  ],
  providers: [
    GoogleMapsUtilsService,
  ]
})
export class GoogleMapsUtilsModule {}

