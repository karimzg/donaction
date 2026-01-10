---
name: skill:creating-angular-forms
description: Creates Angular reactive forms with FormGroup, FormControl, validators, and ErrorDisplayComponent. Use when building forms with validation in donaction-admin.
model: claude-sonnet-4-5
---

# Angular Reactive Form with Validation

## Instructions

- Identify form fields and validation requirements from user request
- Create FormGroup with FormControl for each field
- Apply built-in validators (required, email, minLength, etc.)
- Use custom validators from @donaction-admin/src/app/shared/utils/validators/ when needed
- Use FormControlPipe in template for type-safe control access
- Display validation errors with ErrorDisplayComponent
- Disable submit button when form invalid
- Handle form submission with proper error handling

## Example

**Input:** "Create a login form with email and password fields"

**Output:** Reactive form component with validation

```typescript
// login-form.component.ts
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormControlPipe } from '@shared/pipes/form-control.pipe';
import { ErrorDisplayComponent } from '@shared/components/atoms/error-display/error-display.component';
import { AuthService } from '@shared/services/auth.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    FormControlPipe,
    ErrorDisplayComponent
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isSubmitted = signal(false);
  loading = signal(false);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  onSubmit() {
    this.isSubmitted.set(true);

    if (this.loginForm.invalid) {
      this.toastService.showErrorToast('Please fix form errors');
      return;
    }

    this.loading.set(true);
    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Login successful');
          this.loading.set(false);
        },
        error: (error) => {
          this.toastService.showErrorToast('Login failed');
          this.loading.set(false);
        }
      });
  }

  resetForm() {
    this.loginForm.reset();
    this.isSubmitted.set(false);
  }
}
```

```html
<!-- login-form.component.html -->
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <div class="field">
    <label for="email">Email</label>
    <input
      id="email"
      pInputText
      [formControl]="loginForm | formControl:'email'"
      placeholder="Enter your email"
      class="w-full"
    />
    <app-error-display [control]="loginForm | formControl:'email'" />
  </div>

  <div class="field">
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      pInputText
      [formControl]="loginForm | formControl:'password'"
      placeholder="Enter your password"
      class="w-full"
    />
    <app-error-display [control]="loginForm | formControl:'password'" />
  </div>

  <div class="button-group">
    <button
      pButton
      type="submit"
      label="Login"
      [disabled]="loginForm.invalid"
      [loading]="loading()"
    ></button>
    <button
      pButton
      type="button"
      label="Reset"
      class="p-button-secondary"
      (click)="resetForm()"
    ></button>
  </div>
</form>
```

```scss
// login-form.component.scss
.field {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
```
