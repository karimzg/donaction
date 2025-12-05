import { Component, input } from '@angular/core';
import { DecimalPipe, NgClass } from "@angular/common";

@Component({
    selector: 'app-klub-infos-completion',
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './klub-infos-completion.component.html'
})
export class KlubInfosCompletionComponent {
  public progress = input<number>();
  public label = input<string>("Compte klubr finalisé à ");
}
