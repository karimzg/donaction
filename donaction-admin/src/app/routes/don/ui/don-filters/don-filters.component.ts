import {
  Component,
  input,
  InputSignal,
  model,
  Signal,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { donationStatus, DonFilters } from "../../model/don-filters";
import { MultiSelectModule } from "primeng/multiselect";
import {
  DropdownKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-filter.component";
import {
  DropdownProjectFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-project-filter.component";
import { KlubProject, Klubr } from "@shared/utils/models/klubr";
import { PopoverModule } from "primeng/popover";
import { InputTextModule } from "primeng/inputtext";
import { STATUS_PAYMENT } from "@shared/utils/models/donation-details";
import {
  DropdownInvoiceFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-invoice-filter.component";
import { Invoice } from "@shared/utils/models/invoice";
import { Select } from "primeng/select";
import { ButtonModule } from "primeng/button";
import { DatePicker, DatePickerModule } from "primeng/datepicker";
import { GenericFiltersComponent } from "@shared/components/generics/generic-filters/generic-filters.component";

@Component({
  selector: 'app-don-filters',
  imports: [
    FormsModule,
    DatePickerModule,
    MultiSelectModule,
    DropdownKlubFilterComponent,
    DropdownProjectFilterComponent,
    DropdownInvoiceFilterComponent,
    PopoverModule,
    InputTextModule,
    Select,
    ButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './don-filters.component.html',
  styleUrl: './don-filters.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DonFiltersComponent extends GenericFiltersComponent<DonFilters> {

  public klubrUuid = model<string | undefined>(undefined);

  /* INIT LISTS */
  donationStatusList: Signal<Array<{ label: string, code: string }>> = signal<Array<{
    label: string,
    code: string
  }>>(donationStatus);

  contributionValues: Signal<Array<{ label: string, code: string }>> = signal<Array<{
    label: string,
    code: string
  }>>([
    {label: 'Oui', code: 'true'},
    {label: 'Non', code: 'false'}
  ]);

  /* INPUTS */
  public klubrInit: InputSignal<Klubr | undefined> = input<Klubr | undefined>(undefined);
  public projectInit: InputSignal<KlubProject | undefined | null> = input<KlubProject | undefined | null>(undefined);
  public miscProjectInit: InputSignal<boolean> = input<boolean>(false);
  public invoiceInit: InputSignal<Invoice | undefined | null> = input<Invoice | undefined | null>(undefined);
  public miscInvoiceInit: InputSignal<boolean> = input<boolean>(false);
  public donationStatusInit: InputSignal<{ label: string, code: STATUS_PAYMENT } | undefined> = input<{
    label: string,
    code: STATUS_PAYMENT
  } | undefined>(undefined);
  public donationDateInit: InputSignal<(string | undefined)[] | undefined> = input<(string | undefined)[] | undefined>(undefined);

  /* NON REACTIVEFORM CONTROLS */
  private filterKlubrField = viewChild<DropdownKlubFilterComponent>('klubrDropdown');
  private filterProjectField = viewChild<DropdownKlubFilterComponent>('projectDropdown');
  private filterInvoiceField = viewChild<DropdownKlubFilterComponent>('invoiceDropdown');
  private filterDonationField = viewChild<Select>('donationDropdown');
  private filterCalendarField = viewChild<DatePicker>('donationCalendar');
  private filterContributionField = viewChild<DatePicker>('contributionDropdown');


  /* OVERRIDED METHODS */
  protected override initForm(): void {
    this.filtersForm = new FormGroup({
      klubrUUIDs: new FormControl<Array<string> | null | undefined>({
        value: untracked(this.klubrInit) ? [untracked(this.klubrInit)!.uuid] : undefined,
        disabled: false
      }),
      klubProject: new FormControl<Array<string> | null | undefined>({
        value: untracked(this.projectInit) ? [untracked(this.projectInit)!.uuid] : undefined,
        disabled: false
      }),
      donationDate: new FormControl<Array<string> | null | undefined>({
        value:
          this.donationDateInit() && (this.donationDateInit()![0] !== undefined && this.donationDateInit()![1] !== undefined) ? [this.donationDateInit()![0]!, this.donationDateInit()![1]!] : null
        , disabled: false
      }),
      donationPrice: new FormControl<number | null | undefined>({value: null, disabled: false}),
      donationStatus: new FormControl<string | null | undefined>({
        value: untracked(this.donationStatusInit)?.code,
        disabled: false
      }),
      contribution: new FormControl<boolean | null | undefined>({
        value: undefined,
        disabled: false
      }),
      invoice: new FormControl<Array<string> | null | undefined>({
        value: untracked(this.invoiceInit) ? [untracked(this.invoiceInit)!.uuid] : undefined,
        disabled: false
      }),
    });
  }

  protected override hookOnUpdateKlubrUUIDs(): void {
    this.klubrUuid.set(this.klubrUUIDs.length > 0 ? this.klubrUUIDs[0] : undefined);
  }

  protected override resetFiltersFields(): void {
    this.filterKlubrField()?.clear();
    this.filterProjectField()?.clear();
    this.filterInvoiceField()?.clear();
    this.filterDonationField()?.clear();
    this.filterCalendarField()?.clear();
    this.filterContributionField()?.clear();
  }

  /* NON REACTIVEFORM CONTROLS ACTIONS */
  setKlubFilter(klubrUuid: string) {
    this.setKlub(klubrUuid);
    this.filtersForm.get('klubrUUIDs')?.setValue([klubrUuid]);
    this.filtersForm.get('klubrUUIDs')?.markAsDirty();
  }

  setProjectFilter(projectUuid: string) {
    this.filtersForm.get('klubProject')?.setValue([projectUuid]);
    this.filtersForm.get('klubProject')?.markAsDirty();
  }

  setInvoiceFilter(invoiceUuid: string) {
    this.filtersForm.get('invoice')?.setValue([invoiceUuid]);
    this.filtersForm.get('invoice')?.markAsDirty();
  }
}
