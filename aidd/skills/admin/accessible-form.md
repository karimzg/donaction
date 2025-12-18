---
name: "accessible-form-component"
description: "Create accessible form component with proper ARIA labels, keyboard navigation, and screen reader support"
triggers: ["accessible form", "ARIA labels", "form accessibility", "keyboard navigation", "screen reader", "a11y form", "wcag compliance", "form semantics"]
tags: ["accessibility", "forms", "aria", "a11y", "angular"]
priority: medium
scope: file
output: code
---

# Accessible Form Component

## Instructions

- Use semantic HTML with proper `<label>` elements
- Associate labels with inputs using `for` and `id` attributes
- Add ARIA labels for icon-only buttons
- Add `aria-describedby` for error messages
- Ensure keyboard navigation with proper `tabindex`
- Use `role` attributes for custom interactive elements
- Add status/alert messages for screen readers

## Example

**Input:** "Create an accessible contact form with name, email, and message fields"

**Output:** Fully accessible form component

```typescript
// contact-form.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { FormControlPipe } from '@shared/pipes/form-control.pipe';
import { ErrorDisplayComponent } from '@shared/components/atoms/error-display/error-display.component';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    FormControlPipe,
    ErrorDisplayComponent
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent {
  submitted = signal(false);
  statusMessage = signal<string>('');

  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  onSubmit() {
    this.submitted.set(true);

    if (this.contactForm.invalid) {
      this.statusMessage.set('Please fix form errors before submitting');
      return;
    }

    this.statusMessage.set('Sending message...');
    // Submit logic here
    this.statusMessage.set('Message sent successfully!');
  }
}
```

```html
<!-- contact-form.component.html -->
<form
  [formGroup]="contactForm"
  (ngSubmit)="onSubmit()"
  aria-label="Contact form"
>
  <!-- Name field with proper label association -->
  <div class="form-field">
    <label for="name" class="required">Full Name</label>
    <input
      id="name"
      pInputText
      [formControl]="contactForm | formControl:'name'"
      placeholder="Enter your name"
      aria-required="true"
      aria-describedby="name-error"
      class="w-full"
    />
    <app-error-display
      id="name-error"
      [control]="contactForm | formControl:'name'"
    />
  </div>

  <!-- Email field -->
  <div class="form-field">
    <label for="email" class="required">Email Address</label>
    <input
      id="email"
      type="email"
      pInputText
      [formControl]="contactForm | formControl:'email'"
      placeholder="your@email.com"
      aria-required="true"
      aria-describedby="email-error"
      class="w-full"
    />
    <app-error-display
      id="email-error"
      [control]="contactForm | formControl:'email'"
    />
  </div>

  <!-- Message field -->
  <div class="form-field">
    <label for="message" class="required">Message</label>
    <textarea
      id="message"
      pInputTextarea
      [formControl]="contactForm | formControl:'message'"
      rows="5"
      placeholder="Your message..."
      aria-required="true"
      aria-describedby="message-error"
      class="w-full"
    ></textarea>
    <app-error-display
      id="message-error"
      [control]="contactForm | formControl:'message'"
    />
  </div>

  <!-- Status message for screen readers -->
  @if (statusMessage()) {
    <div
      role="status"
      aria-live="polite"
      class="status-message"
    >
      {{ statusMessage() }}
    </div>
  }

  <!-- Submit button with accessible label -->
  <div class="form-actions">
    <button
      pButton
      type="submit"
      label="Send Message"
      icon="pi pi-send"
      [disabled]="contactForm.invalid && submitted()"
      [loading]="statusMessage() === 'Sending message...'"
      aria-label="Send contact form message"
    ></button>

    <button
      pButton
      type="button"
      label="Clear"
      severity="secondary"
      icon="pi pi-times"
      (click)="contactForm.reset()"
      aria-label="Clear form fields"
    ></button>
  </div>
</form>
```

```scss
// contact-form.component.scss
.form-field {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color);

    &.required::after {
      content: ' *';
      color: var(--red-500);
    }
  }
}

.status-message {
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--surface-100);
  border-left: 4px solid var(--primary-color);
  border-radius: 6px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

// Ensure focus visible for keyboard navigation
:host ::ng-deep {
  input:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
}
```
