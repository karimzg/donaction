import { Component, effect, inject, input, InputSignal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { DeviceService } from "@shared/services/device.service";
import { DatePickerModule } from "primeng/datepicker";

@Component({
  selector: 'app-date-picker',
  imports: [
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    DatePickerModule,
  ],
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent {
  public deviceService = inject(DeviceService);
  control = input.required<FormControl>();
  initValue: InputSignal<string | Date | undefined> = input<string | Date | undefined>(new Date());

  constructor() {
    effect(() => {
      const date: Date | string = this.deviceService.isDesktop() ? new Date(this.initValue() || new Date())
        : (this.initValue() || (new Date().toISOString()));
      this.control().setValue(date);
    });
  }
}
