import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { htmlNbCars } from "../helpers/html-helpers";
import { toHTML } from "ngx-editor";

export const minHtmlLengthValidator = (minLength: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (typeof control.value === 'object' && control.value !== null) ? toHTML(control.value) : control.value;
    const textContentLength = htmlNbCars(value || '');
    return textContentLength <= minLength ? {'minHtmlLength': {value: textContentLength, minLength}} : null;
  };
}
export const maxHtmlLengthValidator = (maxLength: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (typeof control.value === 'object' && control.value !== null) ? toHTML(control.value) : control.value;
    const textContentLength = htmlNbCars(value || '');
    return textContentLength > maxLength ? {'maxHtmlLength': {value: textContentLength, maxLength}} : null;
  };
}
