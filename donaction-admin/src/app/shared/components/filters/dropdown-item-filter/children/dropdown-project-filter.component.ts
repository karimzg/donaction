import { Component, input, InputSignal, OnInit, ViewEncapsulation, } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DropdownItemFilterComponent } from "../dropdown-item-filter.component";
import { KlubProject } from "@shared/utils/models/klubr";
import { Select } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { InputGroup } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { NestedPropertyPipe } from "@shared/pipes/misc/nested-property.pipe";

@Component({
  selector: 'app-dropdown-project-filter',
  imports: [
    CommonModule,
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
  templateUrl: '../dropdown-item-filter.component.html',
  styleUrl: '../dropdown-item-filter.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DropdownProjectFilterComponent extends DropdownItemFilterComponent<KlubProject> implements OnInit {

  override endpointPrefix: InputSignal<string> = input<string>('klub-projets');
  override endpointFilters: InputSignal<Array<string>> = input<Array<string>>(['titre']);
  override optionLabel: InputSignal<string> = input<string>('titre');
  override placeholder: InputSignal<string> = input<string>('Tous les projets');

  constructor() {
    super();
  }

  /* Filter Methods*/
  protected override generateRequestFilters(filterValue?: string): string {
    return filterValue ? this.endpointFilters().map((filter, index) => `&filters[$or][${index}][${filter}][$containsi]=${filterValue}`).join('') : '';
  }
}
