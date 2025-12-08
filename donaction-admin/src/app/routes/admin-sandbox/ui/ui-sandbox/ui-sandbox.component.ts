import { Component, inject } from '@angular/core';
import {
  DropdownMultiKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-multi-klub-filter.component";
import { JsonPipe } from "@angular/common";
import { MainMessageService } from "@shared/services/misc/main-message.service";
import { ButtonDirective } from "primeng/button";

@Component({
  selector: 'app-ui-sandbox',
  imports: [
    DropdownMultiKlubFilterComponent,
    JsonPipe,
    ButtonDirective,
  ],
  templateUrl: './ui-sandbox.component.html',
  styleUrl: './ui-sandbox.component.scss'
})
export class UiSandboxComponent {
  public mms = inject(MainMessageService);
  returnedValue: any;

  reloadPage = () => window.location.reload();
}
