import { Component, input, InputSignal } from '@angular/core';
import { LottieComponent } from "ngx-lottie";

@Component({
    selector: 'app-empty-page',
    imports: [LottieComponent],
    templateUrl: './empty-page.component.html',
    styleUrl: './empty-page.component.scss'
})
export class EmptyPageComponent {

  title: InputSignal<string> = input<string>('');
  subTitle: InputSignal<string> = input<string>('Restez à l\'écoute !');
}
