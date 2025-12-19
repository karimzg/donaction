import { Component, computed, input, InputSignal, signal, Signal, viewChild } from '@angular/core';
import { Button } from "primeng/button";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Select } from "primeng/select";
import { USER_ROLES } from "@shared/utils/models/user-details";
import { GenericFiltersComponent } from "@shared/components/generics/generic-filters/generic-filters.component";
import { UserFilters } from "@app/routes/users/model/user-filters";
import { DatePicker } from "primeng/datepicker";

@Component({
  selector: 'app-users-filters',
  imports: [
    Button,
    ReactiveFormsModule,
    Select,
    DatePicker,
  ],
  templateUrl: './users-filters.component.html',
  styleUrl: './users-filters.component.scss'
})
export class UsersFiltersComponent extends GenericFiltersComponent<UserFilters> {
  /* INIT LISTS */
  public creationDateInit: InputSignal<(string | undefined)[] | undefined> = input<(string | undefined)[] | undefined>(undefined);
  public roles: Signal<Array<{ name: string, weight: number, label: string }>> = computed(() => {
    return (this.permissionsService.memberIsAdminSignal())
      ? [USER_ROLES.Public, USER_ROLES.Authenticated, USER_ROLES.KlubMember, USER_ROLES.KlubMemberLeader, USER_ROLES.AdminEditor, USER_ROLES.Admin]
      : [USER_ROLES.KlubMember, USER_ROLES.KlubMemberLeader]
  });
  public profiles: Signal<Array<{ name: boolean | null, label: string }>> = signal([
    {name: true, label: 'Utilisateurs ayant un profil rattaché'},
    {name: false, label: 'Utilisateurs n\'ayant pas de profil rattaché'},
  ]);
  public origins: Signal<Array<{ name: string | null, label: string }>> = signal([
    {name: 'signupForm', label: 'SignupForm'},
    {name: 'donateur', label: 'Donateur'},
  ]);

  private filterCalendarField = viewChild<DatePicker>('userCalendar');

  /* OVERRIDED METHODS */
  protected override initForm(): void {
    this.filtersForm = new FormGroup({
      creationDate: new FormControl<Array<string> | null | undefined>({
        value:
          this.creationDateInit() && (this.creationDateInit()![0] !== undefined && this.creationDateInit()![1] !== undefined) ? [this.creationDateInit()![0]!, this.creationDateInit()![1]!] : null
        , disabled: false
      }),
      role: new FormControl<string | null | undefined>({value: null, disabled: false}),
      profiles: new FormControl<boolean | null | undefined>({value: null, disabled: false}),
      origin: new FormControl<string | null | undefined>({value: null, disabled: false}),
    });
  }

  protected override resetFiltersFields(): void {
    this.filterCalendarField()?.clear();
  }

}
