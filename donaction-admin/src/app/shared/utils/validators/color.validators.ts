import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const hexColorValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const valid = hexColorRegex.test(control.value);
    return valid ? null : {invalidHexColor: true};
  };
}
