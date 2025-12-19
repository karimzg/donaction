import { Pipe, PipeTransform } from '@angular/core';
import { FormArray, FormGroup } from "@angular/forms";

@Pipe({
  name: 'formArray',
  standalone: true
})
export class FormArrayPipe implements PipeTransform {

  transform(form: FormGroup, formArrayName: string): FormArray {
    return form.get(formArrayName) as FormArray;
  }

}
