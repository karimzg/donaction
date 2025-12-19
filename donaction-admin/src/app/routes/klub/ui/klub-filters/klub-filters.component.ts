import { Component, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { KlubFilters } from "../../model/klub-filters";
import { DatePickerModule } from "primeng/datepicker";
import { PopoverModule } from "primeng/popover";
import { MultiSelectModule } from "primeng/multiselect";
import { PaginatorModule } from "primeng/paginator";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { map } from "rxjs/operators";
import { toSignal } from "@angular/core/rxjs-interop";
import { CachingService } from "@shared/services/caching.service";
import { KlubrService } from "@shared/services/klubr.service";
import { SportType } from "@shared/utils/models/klubr";
import { ButtonModule } from "primeng/button";
import { Select } from "primeng/select";
import { GenericFiltersComponent } from "@shared/components/generics/generic-filters/generic-filters.component";
import {
  DropdownMultiKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-multi-klub-filter.component";
import { SelectButton } from "primeng/selectbutton";

@Component({
  selector: 'app-klub-filters',
  standalone: true,
  imports: [
    DatePickerModule,
    Select,
    PopoverModule,
    DropdownMultiKlubFilterComponent,
    MultiSelectModule,
    PaginatorModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    SelectButton,
  ],
  templateUrl: './klub-filters.component.html',
  styleUrl: './klub-filters.component.scss'
})
export class KlubFiltersComponent extends GenericFiltersComponent<KlubFilters> {
  /* SPECIFIC SERVICES */
  protected cachingService = inject(CachingService);
  protected klubrService = inject(KlubrService);

  /* INIT LISTS */
  // STATUS
  public statusOptions = [
    {label: 'Publié', value: 'published'},
    {label: 'Brouillon', value: 'draft'},
    {label: 'Attente de validation', value: 'waiting_for_validation'},
    {label: 'Attente de documents', value: 'waiting_for_documents'},
    {label: 'Supprimé', value: 'deleted'},
  ];
  // SPORT TYPE
  public sportsOptions: WritableSignal<{ label: string, value: SportType }[]> = signal(
    Object.values(SportType).map(sport => ({label: sport, value: sport}))
  );
  // FEDERATION
  private federationsRequest$ = this.klubrService.getFederations().pipe(
    map(federations => federations.data.map(federation => ({
      name: federation.name,
      id: federation.id,
      acronym: federation.acronym,
    })))
  );
  public federationOptions = toSignal(this.cachingService.cacheObservable('federations-list', this.federationsRequest$));
  // DOCUMENTS TO VALIDATE
  public documentsOptions = [
    {label: 'Oui', value: 'true'},
    {label: 'Non', value: 'false'},
  ];

  /* NON REACTIVEFORM CONTROLS */
  private filterKlubrField = viewChild<DropdownMultiKlubFilterComponent>('klubrDropdown');


  /* OVERRIDED METHODS */
  protected override initForm(): void {
    this.filtersForm = new FormGroup({
      klubrUUIDs: new FormControl<Array<string> | null | undefined>({value: undefined, disabled: false}),
      status: new FormControl<string | null | undefined>({value: null, disabled: false}),
      sportType: new FormControl<string | null | undefined>({value: null, disabled: false}),
      federation: new FormControl<string | null | undefined>({value: null, disabled: false}),
      documentsToValidate: new FormControl<boolean | null | undefined>({value: null, disabled: false}),
    });
  }

  protected override resetFiltersFields(): void {
    this.filterKlubrField()?.clear();
  }

  /* NON REACTIVEFORM CONTROLS ACTIONS */
  setKlubFilter(klubrUuid: any) {
    this.filtersForm.get('klubrUUIDs')?.setValue(klubrUuid?.length > 0 ? klubrUuid : undefined);
    this.filtersForm.get('klubrUUIDs')?.markAsDirty();
  }
}
