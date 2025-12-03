import { Component, input } from '@angular/core';
import { AvatarModule } from "primeng/avatar";
import { Donateur } from "@shared/utils/models/user-details";
import { TagModule } from "primeng/tag";
import { MediaPipe } from "@shared/pipes/media/media.pipe";

@Component({
  selector: 'app-donateur-infos',
  imports: [
    AvatarModule,
    TagModule,
    MediaPipe,
  ],
  templateUrl: './donateur-infos.component.html',
  styleUrl: './donateur-infos.component.scss'
})
export class DonateurInfosComponent {
  public donateur = input<Donateur>();
  public size = input<'normal' | 'large' | 'xlarge'>('normal');
  public displayProTag = input<boolean>(true);
}
