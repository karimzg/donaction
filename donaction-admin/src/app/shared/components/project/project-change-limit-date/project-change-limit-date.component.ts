import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from "@angular/forms";
import { Button } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InplaceModule } from 'primeng/inplace';
import { ErrorDisplayComponent } from "../../form/error-display/error-display.component";
import { DatePickerModule } from "primeng/datepicker";
import { InputTextModule } from "primeng/inputtext";
import { dateAtLeastTomorrowValidator } from "@shared/utils/validators/date.validator";
import { DatePickerComponent } from "../../form/date-picker/date-picker.component";
import { FormControlPipe } from "@shared/pipes/forms/form-control.pipe";
import { ToastService } from "@shared/services/misc/toast.service";

@Component({
  selector: 'app-project-change-limit-date',
  imports: [
    Button,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    InplaceModule,
    ErrorDisplayComponent,
    DatePickerModule,
    InputTextModule,
    DatePickerComponent,
    FormControlPipe,
  ],
  providers: [DialogService],
  templateUrl: './project-change-limit-date.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectChangeLimitDateComponent {
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  public isSubmitted: WritableSignal<boolean> = signal<boolean>(false);
  public loading: WritableSignal<boolean> = signal<boolean>(false);
  public isReady: WritableSignal<boolean> = signal<boolean>(false);
  public message: WritableSignal<string> = signal<string>('false');
  public initDateLimit: WritableSignal<Date> = signal<Date>(this.config.data.dateLimit);

  public dateForm: FormGroup = new FormGroup({});

  constructor() {
    this.initForm();
  }

  /* FORM INIT */
  public initForm(): void {
    this.dateForm = this.fb.group({
      dateLimit: new FormControl<Date | string | undefined>({value: this.config.data.dateLimit, disabled: false},
        [dateAtLeastTomorrowValidator(), Validators.required]),
    });
    this.message.set(this.config.data.message);
    this.isReady.set(true);
  }

  onSubmit() {
    if (!this.dateForm.valid) {
      this.toastService.showErrorToast('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.ref.close(this.dateForm.get('dateLimit')?.value);
  }

  close() {
    this.ref.close();
  }
}

