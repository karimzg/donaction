import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export interface AbstractControlWarn extends AbstractControl {
  warnings: any;
}

export const warn = (validator: ValidatorFn): ValidatorFn => {
  return (c: AbstractControl): ValidationErrors | null => {
    (c as AbstractControlWarn).warnings = validator(c);
    return null;
  };
}

