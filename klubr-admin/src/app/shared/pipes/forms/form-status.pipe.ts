import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup } from "@angular/forms";

@Pipe({
  name: 'formStatus'
})
export class FormStatusPipe implements PipeTransform {

  transform(form: FormGroup, status: 'pristine' | 'dirty'): boolean {
    switch (status) {
      case 'pristine':
        console.log('form.pristine', form.pristine);
        return form.pristine;
      case 'dirty':
        return form.dirty;
    }
    return false;
  }

}
