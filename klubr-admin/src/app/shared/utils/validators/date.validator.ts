import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const dateAtLeastTomorrowValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.pristine) {
      return null;
    }
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return inputDate >= tomorrow ? null : {dateAtLeastTomorrow: true};
  };
}
