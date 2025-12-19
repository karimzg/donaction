import {Component, EventEmitter, Output} from '@angular/core';
import {SliderModule} from "primeng/slider";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-price-filter',
    imports: [
        SliderModule,
        FormsModule
    ],
    templateUrl: './price-filter.component.html',
    styleUrl: './price-filter.component.scss'
})
export class PriceFilterComponent {
  @Output() priceRangeChanged = new EventEmitter<number[]>();
  public priceRange: number[] = [0, 1000];

  constructor() { }

  updatePriceRange() {
    if (this.priceRange[0] > this.priceRange[1] || this.priceRange[1] < this.priceRange[0]) {
      const temp = this.priceRange[0];
      this.priceRange[0] = this.priceRange[1];
      this.priceRange[1] = temp;
    }
    this.priceRange = [this.priceRange[0], this.priceRange[1]];
  }

  onPriceRangeChange() {
    this.updatePriceRange();
    this.priceRangeChanged.emit(this.priceRange);
  }
}
