import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormControl } from "@angular/forms";

@Pipe({
  name: 'formControlCast',
  standalone: true
})
export class FormControlCastPipe implements PipeTransform {

  transform(control: AbstractControl): FormControl {
    return control as FormControl;
  }

}
