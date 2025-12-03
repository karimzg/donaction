import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nbNotNull',
  standalone: true
})
export class NbNotNullPipe implements PipeTransform {

  transform(value: { [key: string]: any }): number {
    return Object.values(value).filter(v => v !== undefined && v !== null).length;
  }

}
