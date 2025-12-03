import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup } from "@angular/forms";

@Pipe({
  name: 'formGroup',
  standalone: true
})
export class FormGroupPipe implements PipeTransform {

  transform(form: FormGroup, formGroupName: string): FormGroup {
    return form.get(formGroupName) as FormGroup;
  }
}
