import { Component, input, InputSignal, model, signal, untracked, viewChild, WritableSignal } from '@angular/core';
import { Button } from "primeng/button";
import { PaginatorModule } from "primeng/paginator";
import { AvatarModule } from "primeng/avatar";
import { STATUS } from "@shared/components/project/project-state-dropdown/model/status-rules";
import { ProjectFilters } from "../../model/project-filters";
import { Klubr, ProjectStatus } from "@shared/utils/models/klubr";
import {
  DropdownKlubMembreFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-membre-filter.component";
import { CustomDropdownItem } from "@shared/components/filters/dropdown-item-filter/dropdown-item-filter.component";
import {
  DropdownKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-filter.component";
import { Select } from "primeng/select";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GenericFiltersComponent } from "@shared/components/generics/generic-filters/generic-filters.component";
import { MultiSelectModule } from "primeng/multiselect";
import {
  DropdownProjectLibrariesFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-project-libraries-filter.component";

@Component({
  selector: 'app-project-filters',
  standalone: true,
  imports: [
    Button,
    Select,
    PaginatorModule,
    AvatarModule,
    FormsModule,
    DropdownKlubMembreFilterComponent,
    DropdownKlubFilterComponent,
    ReactiveFormsModule,
    MultiSelectModule,
    DropdownProjectLibrariesFilterComponent
  ],
  templateUrl: './project-filters.component.html',
  styleUrl: './project-filters.component.scss'
})
export class ProjectFiltersComponent extends GenericFiltersComponent<ProjectFilters> {
  /* INIT LISTS */
  public klubrUuid = model<string | undefined>(undefined);

  public status: WritableSignal<{ label: string, value: ProjectStatus }[]> = signal(
    STATUS.map(s => ({label: s.label, value: s.apiKey}))
  );

  public projectIsFromTmpl: WritableSignal<{ label: string, value: boolean }[]> = signal([
    {label: 'Créé à partir d\'un modèle', value: true},
    {label: 'Non créé à partir d\'un modèle', value: false},
  ]);

  public projectIsTmpl: WritableSignal<{ label: string, value: boolean }[]> = signal([
    {label: 'Modèles de projets', value: true},
    {label: 'Projets uniquement', value: false},
  ]);

  public membersDropdownItem = signal<CustomDropdownItem>({
    labelFields: ['prenom', 'nom'],
    imgField: 'avatar'
  });

  public projectLibrariesDropdownItem = signal<CustomDropdownItem>({
    labelFields: ['label'],
    imgField: 'klubr.logo'
  });

  /* INPUTS */
  public klubrInit: InputSignal<Klubr | undefined> = input<Klubr | undefined>(undefined);
  public projectStatusInit: InputSignal<Array<ProjectStatus> | undefined> = input<Array<ProjectStatus> | undefined>(undefined);

  /* NON REACTIVEFORM CONTROLS */
  private filterKlubrField = viewChild<DropdownKlubFilterComponent>('klubrDropdown');
  private filterMembersField = viewChild<DropdownKlubFilterComponent>('membersDropdown');
  private filterProjectLibraryField = viewChild<DropdownKlubFilterComponent>('projectLibrariesDropdown');

  /* OVERRIDED METHODS */
  protected override initForm(): void {
    this.filtersForm = new FormGroup({
      klubrUUIDs: new FormControl<Array<string> | null | undefined>({
        value: untracked(this.klubrInit) ? [untracked(this.klubrInit)!.uuid] : undefined,
        disabled: false
      }),
      status: new FormControl<Array<ProjectStatus> | null | undefined>({
        value: untracked(this.projectStatusInit) ? untracked(this.projectStatusInit)! : undefined,
        disabled: false
      }),
      member: new FormControl<string | null | undefined>({value: null, disabled: false}),
      isFromTemplate: new FormControl<boolean | null>({value: null, disabled: false}),
      isTemplate: new FormControl<boolean | null>({value: null, disabled: false}),
      projectLibrary: new FormControl<string | null | undefined>({value: null, disabled: false}),
    });
  }

  protected override resetFiltersFields() {
    this.filterKlubrField()?.clear();
    this.filterMembersField()?.clear();
    this.filterProjectLibraryField()?.clear();
  }

  /* NON REACTIVEFORM CONTROLS ACTIONS */
  setKlubFilter(klubrUuid: any) {
    this.klubrUuid.set(klubrUuid);
    this.filtersForm.get('klubrUUIDs')?.setValue(klubrUuid ? [klubrUuid] : undefined);
    this.filtersForm.get('klubrUUIDs')?.markAsDirty();
  }

  setMemberFilter(memberUuid: any) {
    this.filtersForm.get('member')?.setValue(memberUuid ? {uuid: memberUuid} : undefined);
    this.filtersForm.get('member')?.markAsDirty();
  }

  setProjectLibraryFilter(libraryUuid: any) {
    this.filtersForm.get('projectLibrary')?.setValue(libraryUuid ? {uuid: libraryUuid} : undefined);
    this.filtersForm.get('projectLibrary')?.markAsDirty();
  }
}
