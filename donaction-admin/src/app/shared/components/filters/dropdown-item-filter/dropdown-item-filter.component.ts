import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { debounceTime, filter, switchMap, take, tap } from "rxjs/operators";

import { ButtonModule } from "primeng/button";
import { Observable } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { environment } from "@environments/environment";
import { ApiListResult, EntityModel } from "@shared/utils/models/misc";
import { Select, SelectFilterOptions } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputGroup } from "primeng/inputgroup";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { MultiSelect } from "primeng/multiselect";
import { NestedPropertyPipe } from "@shared/pipes/misc/nested-property.pipe";

export type CustomDropdownItem = {
  labelFields: Array<string>;
  imgField?: string;
}

@Component({
  selector: 'app-dropdown-item-filter',
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    Select,
    InputTextModule,
    InputGroup,
    InputGroupAddonModule,
    IconField,
    InputIcon,
    NestedPropertyPipe
],
  templateUrl: './dropdown-item-filter.component.html',
  styleUrl: './dropdown-item-filter.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DropdownItemFilterComponent<T extends EntityModel> implements OnInit {
  protected http = inject(HttpClient);
  protected readonly destroyRef = inject(DestroyRef);
  protected nbItemsPerPage = 5;

  public formGroup = signal<FormGroup | undefined>(undefined);
  public itemsList = signal<Array<Partial<T>>>([]);

  endpointPrefix: InputSignal<string> = input<string>('klubrs');
  endpointSuffix: InputSignal<string> = input<string>('');
  endpointPopulate: InputSignal<Array<string>> = input<Array<string>>([]);
  endpointFilters: InputSignal<Array<string>> = input<Array<string>>(['denomination', 'siegeSocialVille']);
  optionLabel: InputSignal<string> = input<string>('denomination');
  placeholder: InputSignal<string> = input<string>('Sélectionnez un Klub');
  customItem: InputSignal<CustomDropdownItem | undefined> = input<CustomDropdownItem | undefined>(undefined);
  itemInit: InputSignal<T | undefined | null> = input<T | undefined | null>(undefined);
  miscItem: InputSignal<string | undefined> = input<string | undefined>(undefined);
  miscItemInit: InputSignal<boolean> = input<boolean>(false);
  misc2Item: InputSignal<string | undefined> = input<string | undefined>(undefined);
  misc2ItemValue: InputSignal<string | undefined> = input<string | undefined>(undefined);
  misc2ItemInit: InputSignal<boolean> = input<boolean>(false);

  // Single Select
  onItemUUIDSelected: OutputEmitterRef<string | undefined> = output();
  onItemSelected: OutputEmitterRef<T | undefined> = output();
  // Multi Select
  onItemsUUIDsSelected: OutputEmitterRef<Array<string> | undefined> = output();
  onItemsSelected: OutputEmitterRef<Array<T> | undefined> = output();

  private filterField = viewChild<Select | MultiSelect>('filterDropdown');
  private isMultiSelect = computed(() => this.filterField() instanceof MultiSelect);

  constructor() {
    effect(() => {
      if (this.endpointSuffix() !== undefined) {
        this.getItemsList().subscribe();
      }
    });
  }

  ngOnInit(): void {
    const itemInit = this.miscItemInit()
      ? ({
        uuid: null,
        [this.optionLabel()]: this.miscItem()
      } as unknown as T)
      : (this.misc2ItemInit()
          ? ({
            uuid: this.misc2ItemValue(),
            [this.optionLabel()]: this.misc2Item()
          } as unknown as T)
          : this.itemInit()
      );
    if (this.isMultiSelect()) {
      this.formGroup.set(new FormGroup({
        selectedItem: new FormControl<Array<T>>(itemInit ? [itemInit] : []),
        filterValue: new FormControl<string | null>(null)
      }));
    } else {
      this.formGroup.set(new FormGroup({
        selectedItem: new FormControl<T | null>(itemInit || null),
        filterValue: new FormControl<string | null>(null)
      }));
    }
    this.formGroup()!.get('selectedItem')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((value) => !!value),
      tap((value) => {
        if (this.isMultiSelect()) {
          this.onItemsUUIDsSelected.emit(value.map((item: T) => item.uuid));
          this.onItemsSelected.emit(value);
        } else {
          this.onItemUUIDSelected.emit(value.uuid)
          this.onItemSelected.emit(value);
        }
      }),
    ).subscribe();
    this.formGroup()!.get('filterValue')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(500),
      switchMap((value) => this.getItemsList(value)),
    ).subscribe();
  }

  /* Filter Methods*/
  private generateRequestEndpoint(filterValue?: string): string {
    const filters = this.generateRequestFilters(filterValue);
    const populate = untracked(this.endpointPopulate).map((pop, index) => `&populate[${index}]=${pop}`).join('');
    return environment.apiUrl + `${untracked(this.endpointPrefix)}?pagination[pageSize]=${this.nbItemsPerPage}${untracked(this.endpointSuffix)}${populate}${filters}`;
  }

  protected generateRequestFilters(filterValue?: string): string {
    return filterValue ? untracked(this.endpointFilters).map((filter, index) => `&filters[$or][${index}][${filter}][$containsi]=${filterValue}`).join('') : '';
  }

  private getItemsList(filter?: string): Observable<ApiListResult<T>> {
    return this.http.get<ApiListResult<T>>(this.generateRequestEndpoint(filter)).pipe(
      take(1),
      tap((res) => {
        const items = res.data;
        if (this.miscItem() !== undefined) {
          const miscItem = {uuid: null, [this.optionLabel()]: this.miscItem()} as unknown as T;
          items.unshift(miscItem);
        }
        if (this.misc2Item() !== undefined) {
          const miscItem = {uuid: this.misc2ItemValue(), [this.optionLabel()]: this.misc2Item()} as unknown as T;
          items.unshift(miscItem);
        }
        if (untracked(this.itemInit) !== undefined) {
          const index = res.data.findIndex((item) => item.uuid === untracked(this.itemInit)?.uuid);
          if (index === -1) {
            items.unshift(untracked(this.itemInit)!);
          }
        }
        this.itemsList.set(items);
      }),
    );
  }

  public resetFunction(options: SelectFilterOptions) {
    // @ts-ignore
    options.reset();
    this.formGroup()!.get('filterValue')?.reset();
  }

  public onClear() {
    this.onItemSelected.emit(undefined);
    this.onItemUUIDSelected.emit(undefined);
  }

  public clear() {
    if (this.isMultiSelect()) {
      (this.filterField() as MultiSelect)?.updateModel([]);
    } else {
      (this.filterField() as Select)?.clear();
    }
  }
}
