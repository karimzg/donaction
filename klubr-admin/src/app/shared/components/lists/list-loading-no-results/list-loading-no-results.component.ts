import { Component, input } from '@angular/core';
import { LottieComponent } from "ngx-lottie";

@Component({
  selector: 'app-list-loading-no-results',
  imports: [
    LottieComponent
  ],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center w-full">
        <ng-lottie
          width="200px"
          [options]="{path: 'assets/animations/loading.json'}"
        ></ng-lottie>
      </div>
    } @else {
      <div class="flex flex-col w-full h-full items-center justify-center">
        <ng-lottie
          width="300px"
          [options]="{path: 'assets/animations/no-donations.json'}">
        </ng-lottie>
      </div>
      @if (!hideSentence()) {
        @if (hasFilters()) {
          <p class="text-center text-gray-500">Aucun {{ label() }} ne correspond à vos critères de recherche</p>
        } @else {
          <p class="text-center text-gray-500">Aucun {{ label() }}</p>
        }
      }
      <div class="flex flex-col w-full h-full items-center justify-center">
        <ng-content></ng-content>
      </div>
    }`
})
export class ListLoadingNoResultsComponent {
  public label = input.required<string>();
  public loading = input<boolean>(false);
  public hasFilters = input<boolean>(false);
  public hideSentence = input<boolean>(false);
}
