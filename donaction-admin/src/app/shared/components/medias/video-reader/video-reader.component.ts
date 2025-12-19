import {Component, input, InputSignal} from '@angular/core';

@Component({
    selector: 'app-video-reader',
    imports: [],
    templateUrl: './video-reader.component.html',
    styleUrl: './video-reader.component.scss'
})
export class VideoReaderComponent {
  public videoUrl: InputSignal<string | undefined> = input<string | undefined>(undefined);
}
