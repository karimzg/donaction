import { Component, input, ViewEncapsulation } from '@angular/core';
import { NgStyle } from "@angular/common";
import { Tag } from "primeng/tag";
import { RouterLink } from "@angular/router";
import { MeterGroup } from "primeng/metergroup";

@Component({
  selector: 'app-klub-stats-card',
  imports: [
    NgStyle,
    Tag,
    RouterLink,
    MeterGroup
  ],
  templateUrl: './klub-stats-card.component.html',
  styles: [
    `
      .klub-stats-card {
        --p-metergroup-gap: 0.5rem;
        --p-metergroup-label-list-horizontal-gap: 0.5rem;

        p-metergrouplabel {
          font-size: 0.8rem;
        }
      }
    `
  ],
  encapsulation: ViewEncapsulation.None,
})
export class KlubStatsCardComponent {
  textColor = input.required<string>();
  title = input.required<string>();
  value = input.required<number>();
  symbol = input<string>();
  value2 = input<number>();
  symbol2 = input<string>();
  routerLinkValue = input<Array<string>>();
  routerLinkQueryParams = input<{}>();
  meterValues = input<Array<{ label: string, value: number, color: string }>>();
}
