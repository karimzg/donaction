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
import { NestedPropertyPipe } from "@shared/pipes/misc/nested-property.pipe";

@Component({
  selector: 'app-dropdown-klub-membre-filter',
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
export class DropdownKlubMembreFilterComponent extends DropdownItemFilterComponent<KlubrMembre> implements OnInit {

  override endpointPrefix: InputSignal<string> = input<string>('klubr-membres');
  override endpointFilters: InputSignal<Array<string>> = input<Array<string>>(['nom', 'prenom', 'fonction', 'role']);
  override optionLabel: InputSignal<string> = input<string>('nom');
  override placeholder: InputSignal<string> = input<string>('Sélectionnez un membre');

  constructor() {
    super();
  }

  /* Filter Methods*/
  protected override generateRequestFilters(filterValue?: string): string {
    return filterValue ? this.endpointFilters().map((filter, index) => `&filters[$or][${index}][${filter}][$containsi]=${filterValue}`).join('') : '';
  }
}
