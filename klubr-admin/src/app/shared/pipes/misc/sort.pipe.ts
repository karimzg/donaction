import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(arrayToSort: Array<any>, order: 'ASC' | 'DESC' = 'ASC'): Array<any> {
    return arrayToSort.sort((a, b) => (order === 'ASC')
      ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

}
