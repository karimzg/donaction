import { Component, input, InputSignal, OnInit, ViewEncapsulation, } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DropdownItemFilterComponent } from "../dropdown-item-filter.component";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { Select } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { InputGroup } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { ENDPOINTS } from "@shared/utils/config/endpoints";
import { NestedPropertyPipe } from "@shared/pipes/misc/nested-property.pipe";

@Component({
  selector: 'app-dropdown-project-libraries-filter',
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
export class DropdownProjectLibrariesFilterComponent extends DropdownItemFilterComponent<KlubrMembre> implements OnInit {

  override endpointPrefix: InputSignal<string> = input<string>(ENDPOINTS.PROJECT_TMPL_LIBRARY);
  override endpointFilters: InputSignal<Array<string>> = input<Array<string>>(['label']);
  override optionLabel: InputSignal<string> = input<string>('label');
  override placeholder: InputSignal<string> = input<string>('Sélectionnez une librairie de projet');

  constructor() {
    super();
  }

  /* Filter Methods*/
  protected override generateRequestFilters(filterValue?: string): string {
    return filterValue ? this.endpointFilters().map((filter, index) => `&filters[$or][${index}][${filter}][$containsi]=${filterValue}`).join('') : '';
  }
}
