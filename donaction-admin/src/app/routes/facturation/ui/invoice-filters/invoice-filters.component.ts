import { Component, input, InputSignal, signal, untracked, viewChild, WritableSignal } from '@angular/core';
import { GenericFiltersComponent } from "@shared/components/generics/generic-filters/generic-filters.component";
import { InvoiceFilters } from "@app/routes/facturation/model/invoice-filters";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  DropdownKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-filter.component";
import { Button } from "primeng/button";
import { Select } from "primeng/select";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { SelectButton } from "primeng/selectbutton";
import { DatePipe } from "@angular/common";
import {
  DropdownMultiKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-multi-klub-filter.component";
import { Klubr } from "@shared/utils/models/klubr";

@Component({
  selector: 'app-invoice-filters',
  imports: [
    Button,
    DropdownMultiKlubFilterComponent,
    Select,
    FormsModule,
    IconField,
    InputIcon,
    InputText,
    ReactiveFormsModule,
    SelectButton
  ],
  templateUrl: './invoice-filters.component.html',
  styleUrl: './invoice-filters.component.scss'
})
export class InvoiceFiltersComponent extends GenericFiltersComponent<InvoiceFilters> {
  private readonly datePipe = new DatePipe('fr-FR');

  /* NON REACTIVEFORM CONTROLS */
  private filterKlubrField = viewChild<DropdownKlubFilterComponent>('klubrDropdown');

  /* INPUTS */
  klubrInit: InputSignal<Klubr | undefined> = input<Klubr | undefined>(undefined);

  /* INIT LISTS */
  public availableMonths: WritableSignal<Array<{
    month: string,
    year: string,
    currentMonth?: boolean
  }>> = signal(this.generateAvailableMonths());

  /* OVERRIDED METHODS */
  protected override initForm(): void {
    this.filtersForm = new FormGroup({
      billingPeriodSmall: new FormControl<{ month: string; year: string; } | null | undefined>({
        value: undefined,
        disabled: false
      }),
      searchParams: new FormControl<string | null | undefined>({value: undefined, disabled: false}),
      klubrUUIDs: new FormControl<Array<string> | null | undefined>({
        value: untracked(this.klubrInit) ? [untracked(this.klubrInit)!.uuid] : undefined,
        disabled: false
      }),
      invoicePdfPath: new FormControl<boolean | null | undefined>({value: null, disabled: false}),
      firstSentEmailDate: new FormControl<boolean | null | undefined>({value: null, disabled: false}),
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

  /* SPECIFIC METHODS */
  generateAvailableMonths() {
    const currentMonth = (new Date()).getMonth() + 1;
    const currentYear = (new Date()).getFullYear();
    const availableMonths = [];
    for (let i = 0; i < 12; i++) {
      const transformedDate = this.datePipe.transform(new Date(currentYear, currentMonth - i - 1, 1), 'MMMM yyyy')!;
      const label = transformedDate.charAt(0).toUpperCase() + transformedDate.slice(1);
      availableMonths.push({
        month: (currentMonth - i).toString().padStart(2, '0'),
        year: (currentMonth - i) <= 0 ? (currentYear - 1).toString() : currentYear.toString(),
        label,
        currentMonth: i === 0,
      });
    }
    return availableMonths;
  }
}
