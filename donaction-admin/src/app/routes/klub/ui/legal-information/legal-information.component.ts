/// <reference types="google.maps" />
import { AfterViewInit, Component, inject, untracked, ViewEncapsulation } from '@angular/core';
import { Button } from "primeng/button";
import { ColorPickerModule } from "primeng/colorpicker";
import { ErrorDisplayComponent } from "@shared/components/form/error-display/error-display.component";
import { FormControlPipe } from "@shared/pipes/forms/form-control.pipe";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { GenericUpdateComponent } from "@shared/components/generics/generic-update/generic-update.component";
import { Klubr, LegalStructureType, SportType } from "@shared/utils/models/klubr";
import { Observable } from "rxjs";
import { SharedService } from "@shared/data-access/repositories/shared.service";
import { GoogleMapsUtilsModule } from "@shared/components/form/google-maps/google-maps-utils.module";
import { GoogleMapsUtilsService } from "@shared/components/form/google-maps/google-maps-utils.service";
import { KlubInfosComponent } from "@shared/components/klub/klub-infos/klub-infos.component";
import { map, tap } from "rxjs/operators";
import { InputNumberModule } from "primeng/inputnumber";
import { AutocompleteOffDirective } from "@shared/components/form/autocomplete-off/autocomplete-off.directive";
import {
  InvalidControlScrollDirective
} from "@shared/components/form/invalid-control-scroll/invalid-control-scroll.directive";
import { AvatarModule } from "primeng/avatar";
import { KlubrService } from "@shared/services/klubr.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { CachingService } from "@shared/services/caching.service";
import { Select } from "primeng/select";
import { webSiteValidator } from "@shared/utils/validators/website.validators";
import { DatePickerModule } from "primeng/datepicker";
import { fadeAnimation } from "@shared/utils/animations/animations";
import PlaceResult = google.maps.places.PlaceResult;

@Component({
  selector: 'app-legal-information',
  imports: [
    Button,
    ColorPickerModule,
    ErrorDisplayComponent,
    FormControlPipe,
    InputTextModule,
    PaginatorModule,
    ReactiveFormsModule,
    GoogleMapsUtilsModule,
    KlubInfosComponent,
    InputNumberModule,
    DatePickerModule,
    AutocompleteOffDirective,
    InvalidControlScrollDirective,
    AvatarModule,
    Select,
  ],
  providers: [
    GoogleMapsUtilsService,
  ],
  templateUrl: './legal-information.component.html',
  styleUrl: './legal-information.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [fadeAnimation]
})
export class LegalInformationComponent extends GenericUpdateComponent<Klubr> implements AfterViewInit {
  /* SPECIFIC SERVICES */
  private sharedService = inject(SharedService);
  private klubrService = inject(KlubrService);
  private gMapsUtilsService = inject(GoogleMapsUtilsService);
  private cachingService = inject(CachingService);

  /* SPECIFIC VARS */
  // MESSAGES
  protected override successMsg = 'Les informations légales ont été mises à jour';
  protected override errorUpdateMsg = 'Les informations légales n\'ont pas pu être modifiées';
  protected override errorCreateMsg = 'Les informations légales n\'ont pas pu être créées';
  protected override routePrefix = '/klub/infos-legales';
  // LISTS
  public associationTypeOptions = [
    {label: 'Sport', value: 'Sport'},
  ];
  public legalStructureOptions: Array<{
    label: LegalStructureType,
    value: LegalStructureType
  }> = Object.values(LegalStructureType).map(legalStructureType => ({
    label: legalStructureType,
    value: legalStructureType
  }));
  public sportTypeOptions: Array<{ label: SportType, value: SportType }> = Object.values(SportType).map(sportType => ({
    label: sportType,
    value: sportType
  }));

  // Dropdown options
  private federationsRequest$ = this.klubrService.getFederations().pipe(
    map(federations => federations.data.map(federation => ({
      name: federation.name,
      id: federation.id,
      acronym: federation.acronym,
    })))
  );
  public federationOptions = toSignal(this.cachingService.cacheObservable('federations-list', this.federationsRequest$));
  // GOOGLE PLACE
  public googlePlace: PlaceResult | undefined;
  // CREATION YEAR
  public maxDate: Date = new Date();


  /* FORM INIT */
  protected override initForm(): void {
    const entity = untracked(this.entitySignal);
    this.googlePlace = entity?.googlePlace;
    this.entityForm = new FormGroup({
      denomination: new FormControl({value: entity?.denomination || undefined, disabled: false},
        Validators.required),
      acronyme: new FormControl({value: entity?.acronyme || undefined, disabled: false},
        [Validators.required, Validators.maxLength(8)]),
      slogan: new FormControl({value: entity?.slogan || undefined, disabled: false}),
      legalStatus: new FormControl({value: entity?.legalStatus, disabled: false},
        Validators.required),
      associationType: new FormControl({value: entity?.associationType, disabled: false},
        Validators.required),
      sportType: new FormControl({value: entity?.sportType, disabled: false},
        Validators.required),
      federationLink: new FormControl({value: entity?.federationLink?.id, disabled: false},
        Validators.required
      ),
      // TODO: set validators
      klubYearCreation: new FormControl({
          value: entity?.klubYearCreation ? new Date(entity?.klubYearCreation, 0) : null,
          disabled: false
        },
      ),
      webSite: new FormControl({value: entity?.webSite, disabled: false}, [webSiteValidator()]
      ),
      googlePlace: new FormControl({value: entity?.googlePlace?.formatted_address, disabled: false},
        Validators.required),
      siegeSocialAdresse: new FormControl({
        value: this.gMapsUtilsService.getAddress(entity?.googlePlace),
        disabled: true
      }),
      siegeSocialAdresse2: new FormControl({value: entity?.siegeSocialAdresse2, disabled: false}),
      siegeSocialCP: new FormControl({
        value: this.gMapsUtilsService.getPostCode(entity?.googlePlace),
        disabled: true
      }),
      siegeSocialVille: new FormControl({
        value: this.gMapsUtilsService.getCity(entity?.googlePlace),
        disabled: true
      }),
      siegeSocialPays: new FormControl({
        value: this.gMapsUtilsService.getCountry(entity?.googlePlace),
        disabled: true
      }),
      siegeSocialDepartement: new FormControl({
        value: this.gMapsUtilsService.getDistrict(entity?.googlePlace),
        disabled: true
      }),
      siegeSocialRegion: new FormControl({
        value: this.gMapsUtilsService.getState(entity?.googlePlace),
        disabled: true
      }),
    });
    this.entityForm.updateValueAndValidity();

  }

  public override resetForm(): void {
    const entity = untracked(this.entitySignal);
    this.googlePlace = entity?.googlePlace;
    this.entityForm.patchValue({
      denomination: entity?.denomination || '',
      acronyme: entity?.acronyme || '',
      slogan: entity?.slogan || '',
      legalStatus: entity?.legalStatus || '',
      associationType: entity?.associationType || 'Sport',
      sportType: entity?.sportType || '',
      federationLink: entity?.federationLink?.id || null,
      klubYearCreation: entity?.klubYearCreation ? new Date(entity!.klubYearCreation, 0) : null,
      webSite: entity?.webSite || '',
      googlePlace: entity?.googlePlace.formatted_address || '',
      siegeSocialAdresse: this.gMapsUtilsService.getAddress(entity?.googlePlace) || '',
      siegeSocialAdresse2: '',
      siegeSocialCP: this.gMapsUtilsService.getPostCode(entity?.googlePlace) || '',
      siegeSocialVille: this.gMapsUtilsService.getCity(entity?.googlePlace) || '',
      siegeSocialPays: this.gMapsUtilsService.getCountry(entity?.googlePlace) || '',
      siegeSocialDepartement: this.gMapsUtilsService.getDistrict(entity?.googlePlace) || '',
      siegeSocialRegion: this.gMapsUtilsService.getState(entity?.googlePlace) || '',
    });
    this.entityForm.markAsPristine();
  }

  protected override formFields(publish = false): { [key: string]: any } {

    const klubYearCreation = (this.entityForm.get('klubYearCreation')?.value)
      ? (new Date(this.entityForm.get('klubYearCreation')!.value))?.getFullYear()
      : null;

    if (this.entityForm.get('googlePlace')?.dirty) {
      const {googlePlace, ...entityValues} = this.entityForm.value;
      return {
        ...entityValues,
        googlePlace: this.googlePlace,
        klubYearCreation,
      }
    } else {
      const {googlePlace, ...entityValues} = this.entityForm.value;
      return {
        ...entityValues,
        klubYearCreation,
      };
    }
  }

  protected override serviceUpdate(uuid: string, formValues: any): Observable<Klubr> {
    return this.sharedService.updateKlub(uuid, formValues).pipe(
      tap((klubr) => this.sharedFacade.updateKlubInStore(klubr))
    );
  }

  /* SPECIFIC METHODES */
  override ngAfterViewInit(): void {
    if (this.firstInput()?.nativeElement) {
      this.firstInput()!.nativeElement.focus();
    }
  }

  /*
  * GMAP
  * */
  checkAddress() {
    if (!this.googlePlace?.formatted_address) {
      this.entityForm.get('googlePlace')?.setErrors({googlePlaceFormat: true});
    } else {
      this.entityForm.get('googlePlace')?.setErrors(null);
    }
  }

  onAddressSelected(result: PlaceResult) {
    if (result) {
      this.googlePlace = result;
      this.entityForm.get('siegeSocialAdresse')?.setValue(this.gMapsUtilsService.getAddress(result));
      this.entityForm.get('')?.setValue('');
      this.entityForm.get('siegeSocialCP')?.setValue(this.gMapsUtilsService.getPostCode(result));
      this.entityForm.get('siegeSocialVille')?.setValue(this.gMapsUtilsService.getCity(result));
      this.entityForm.get('siegeSocialPays')?.setValue(this.gMapsUtilsService.getCountry(result));
      this.entityForm.get('siegeSocialDepartement')?.setValue(this.gMapsUtilsService.getDistrict(result));
      this.entityForm.get('siegeSocialRegion')?.setValue(this.gMapsUtilsService.getState(result));
      this.entityForm.get('googlePlace')?.setErrors(null);
      if (!this.entityForm.get('webSite')?.value || this.entityForm.get('webSite')?.value === '') {
        this.entityForm.get('webSite')?.setValue(this.gMapsUtilsService.getWebSite(result));
      }
    } else {
      this.entityForm.get('googlePlace')?.setErrors({googlePlaceFormat: true});
      this.googlePlace = undefined;
    }
  }

  selectAllContent($event: FocusEvent) {
    ($event.target as HTMLInputElement).select();
  }
}
