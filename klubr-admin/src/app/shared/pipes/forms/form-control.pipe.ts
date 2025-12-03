import { Pipe, PipeTransform } from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";

@Pipe({
  name: 'formControl',
  standalone: true
})
export class FormControlPipe implements PipeTransform {

  transform(form: FormGroup, formControlName: string): FormControl {
    return form.get(formControlName) as FormControl;
  }

}
