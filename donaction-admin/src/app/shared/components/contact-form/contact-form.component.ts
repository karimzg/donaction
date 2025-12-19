import { Component, inject, input, InputSignal, OnInit, output, OutputEmitterRef, signal, } from '@angular/core';
import { Button } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { ErrorDisplayComponent } from "../form/error-display/error-display.component";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthFacade } from "@app/routes/auth/data-access/+state/auth.facade";
import { FormService } from "@shared/services/form.service";
import { createRecaptchaToken } from "@shared/utils/helpers/recaptcha-helpers";
import { environment } from "@environments/environment";
import { ToastService } from "@shared/services/misc/toast.service";

@Component({
  selector: 'app-contact-form',
  imports: [
    Button,
    DialogModule,
    ErrorDisplayComponent,
    InputTextModule,
    TextareaModule,
    ReactiveFormsModule
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private formService = inject(FormService);
  private toastService = inject(ToastService);

  public isDialog: InputSignal<boolean | undefined> = input<boolean | undefined>(undefined);
  public dialogState: OutputEmitterRef<boolean | undefined> = output();

  public me = this.authFacade.me();
  public contactForm: FormGroup = new FormGroup({});
  public isSubmitted = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.setCaptchaToken();
  }

  public initForm(): void {
    this.contactForm = this.fb.group({
      email: [this.me?.email, Validators.required],
      objet: [undefined, Validators.required],
      message: [undefined, Validators.required],
      recaptcha: [null, Validators.required],
      origin: ['admin-centre-aide', Validators.required]
    })
  }

  resetForm(): void {
    this.contactForm.reset({
      email: this.me?.email,
      objet: undefined,
      message: undefined,
      recaptcha: this.contactForm.value.recaptcha,
      origin: this.contactForm.value.origin
    });
  }

  public async setCaptchaToken(): Promise<void> {
    const formToken = await createRecaptchaToken(environment.ANGULAR_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY, "CREATE_CONTACT_FORM");
    this.contactForm.patchValue({recaptcha: formToken});
  }

  public onSubmit(): void {
    if (this.contactForm.valid && this.contactForm.value.recaptcha) {
      this.formService.createContactForm(
        this.contactForm.value.email,
        this.contactForm.value.objet,
        this.contactForm.value.message,
        this.contactForm.value.recaptcha,
        this.contactForm.value.origin
      ).subscribe({
        next: (value) => {
          this.resetForm();
          this.toastService.showSuccessToast('Succès', 'Email envoyé');
          if (this.isDialog()) {
            this.dialogState.emit(false);
          }
        }
      })
    }
  }

  public closeDialog(): void {
    this.resetForm();
    if (this.isDialog()) {
      this.dialogState.emit(false);
    }
  }
}
