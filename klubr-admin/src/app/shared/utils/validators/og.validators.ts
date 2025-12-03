import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const metaDescriptionValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const webSiteRegex = /^https?:\/\/.+$/;
    const valid = webSiteRegex.test(control.value);
    return valid ? null : {website: true};
  };
}
