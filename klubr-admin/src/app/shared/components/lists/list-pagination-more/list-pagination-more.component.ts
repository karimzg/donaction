import { Component, input, model, output } from '@angular/core';
import { MetaPagination } from "@shared/utils/models/misc";
import { Button } from "primeng/button";

@Component({
  selector: 'app-list-pagination-more',
  imports: [
    Button
  ],
  template: `
    @if (pagination() && pagination()!.page < pagination()!.pageCount) {
      <div class="flex mt-4 justify-center">
        <p-button (click)="nextPage.emit(pagination()!.page + 1)" [loading]="loading()"
                  label="Voir +" class="self-end" severity="contrast"/>
      </div>
    }`,
})
export class ListPaginationMoreComponent {
  public pagination = model<MetaPagination | undefined>();
  public loading = input<boolean>(false);
  public nextPage = output<number>();
}
