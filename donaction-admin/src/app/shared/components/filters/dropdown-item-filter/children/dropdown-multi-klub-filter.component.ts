import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { InputGroup } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import {
  DropdownKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-filter.component";
import { MultiSelectModule } from "primeng/multiselect";

@Component({
  selector: 'app-dropdown-multi-klubr-filter',
  imports: [
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MultiSelectModule,
    InputTextModule,
    InputGroup,
    InputGroupAddonModule,
    IconField,
    InputIcon,
  ],
  templateUrl: '../dropdown-multi-item-filter.component.html',
  styleUrl: '../dropdown-item-filter.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DropdownMultiKlubFilterComponent extends DropdownKlubFilterComponent implements OnInit {
  
}
