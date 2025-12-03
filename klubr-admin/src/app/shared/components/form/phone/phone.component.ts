import { Component, inject, input } from '@angular/core';
import { DeviceService } from "@shared/services/device.service";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { InputMaskModule } from "primeng/inputmask";

@Component({
  selector: 'app-phone',
  imports: [
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    InputMaskModule,
  ],
  template: `
    @if (deviceService.isDesktop()) {
      <p-inputmask
        [formControl]="control()"
        class="w-full"
        mask="+99 9 99 99 99 99"
        placeholder="+33 6 12 34 56 78"/>
    } @else {
      <input
        pInputText
        class="w-full"
        type="tel"
        placeholder="+33 6 12 34 56 78"
        [formControl]="control()">
    }`,
})
export class PhoneComponent {
  public deviceService = inject(DeviceService);
  control = input.required<FormControl>();
}
