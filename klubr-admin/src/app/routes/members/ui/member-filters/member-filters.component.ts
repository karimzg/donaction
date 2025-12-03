import {
  Component,
  computed,
  input,
  InputSignal,
  Signal,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from "primeng/calendar";
import { MultiSelectModule } from "primeng/multiselect";
import {
  DropdownKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-filter.component";
import { MEMBER_ROLES } from "@shared/utils/models/user-details";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { InputTextModule } from "primeng/inputtext";
import { ProfileFilters } from "../../model/profile-filters";
import { Select } from "primeng/select";
import { ButtonModule } from "primeng/button";
import { GenericFiltersComponent } from "@shared/components/generics/generic-filters/generic-filters.component";
import { Klubr } from "@shared/utils/models/klubr";

@Component({
  selector: 'app-member-filters',
  imports: [
    FormsModule,
    CalendarModule,
    MultiSelectModule,
    DropdownKlubFilterComponent,
    OverlayPanelModule,
    InputTextModule,
    Select,
    ButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './member-filters.component.html',
  styleUrl: './member-filters.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MemberFiltersComponent extends GenericFiltersComponent<ProfileFilters> {
  /* INIT LISTS */
  roles: Signal<Array<{ name: string, weight: number, label: string }>> = computed(() => {
    return (this.permissionsService.memberIsAdminSignal())
      ? [MEMBER_ROLES.KlubMember, MEMBER_ROLES.KlubMemberLeader, MEMBER_ROLES.NetworkLeader, MEMBER_ROLES.AdminEditor, MEMBER_ROLES.Admin]
      : [MEMBER_ROLES.KlubMember, MEMBER_ROLES.KlubMemberLeader]
  });
  accounts: Signal<Array<{ value: boolean | null, label: string }>> = signal([
    {value: true, label: 'Membres ayant un compte'},
    {value: false, label: 'Membres n\'ayant pas de compte'},
  ]);

  /* INPUTS */
  klubrInit: InputSignal<Klubr | undefined> = input<Klubr | undefined>(undefined);
  accountInit: InputSignal<boolean | undefined> = input<boolean | undefined>(undefined);

  /* NON REACTIVEFORM CONTROLS */
  private filterKlubrField = viewChild<DropdownKlubFilterComponent>('klubrDropdown');

  /* OVERRIDED METHODS */
  protected override initForm(): void {
    this.filtersForm = new FormGroup({
      klubrUUIDs: new FormControl<Array<string> | null | undefined>({
        value: untracked(this.klubrInit) ? [untracked(this.klubrInit)!.uuid] : undefined,
        disabled: false
      }),
      role: new FormControl<string | null | undefined>({value: null, disabled: false}),
      account: new FormControl<boolean | null | undefined>({value: untracked(this.accountInit), disabled: false}),
    });
  }

  protected override resetFiltersFields(): void {
    this.filterKlubrField()?.clear();
  }

  /* NON REACTIVEFORM CONTROLS ACTIONS */
  setKlubFilter(klubrUuid: any) {
    this.filtersForm.get('klubrUUIDs')?.setValue(klubrUuid ? [klubrUuid] : undefined);
    this.filtersForm.get('klubrUUIDs')?.markAsDirty();
  }
}
