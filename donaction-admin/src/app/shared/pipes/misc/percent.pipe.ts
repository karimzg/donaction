import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percent',
  standalone: true
})
export class PercentPipe implements PipeTransform {

  transform(amount: number, totalAmount: number): number {
    if (totalAmount > 0) {
      return amount / totalAmount * 100;
    }
    return 0;
  }

}
