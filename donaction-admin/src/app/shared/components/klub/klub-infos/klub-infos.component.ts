import { Component, computed, input } from '@angular/core';
import { AvatarModule } from "primeng/avatar";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { Klubr } from "@shared/utils/models/klubr";
import { NgClass } from "@angular/common";
import { ProgressBarModule } from "primeng/progressbar";
import { KlubInfosCompletionComponent } from "../klub-infos-completion/klub-infos-completion.component";

@Component({
  selector: 'app-klub-infos',
  imports: [
    AvatarModule,
    MediaPipe,
    NgClass,
    ProgressBarModule,
    KlubInfosCompletionComponent,
  ],
  templateUrl: './klub-infos.component.html',
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 8px;

      .avatar-logo {
        flex: 1 0 auto;
      }

      &.reverse {
        flex-direction: row-reverse;
        text-align: right;
      }

      .klub-infos {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      span {
        display: block;
        margin: 0;
        padding: 0;
        line-height: 1;
        font-size: 1rem;
        font-weight: 400;
      }

      em {
        font-size: .9rem;
        font-weight: 400;
      }
    }`,
  host: {
    '[class.reverse]': 'displayReverse()'
  }
})
export class KlubInfosComponent {
  public klub = input<Klubr>();
  public displaySport = input<boolean>(false);
  public customLabel = input<string | undefined>(undefined);
  public displayReverse = input<boolean>(false);
  public displayProgress = input<boolean>(false);
  public size = input<'normal' | 'large' | 'xlarge'>('normal');
  public progress = computed<number>(() => ((this.klub()?.klubr_info?.requiredDocsValidatedCompletion || 0) + (this.klub()?.klubr_info?.requiredFieldsCompletion || 0)) / 2);
  public showProgress = computed<boolean>(() => this.displayProgress() && this.progress() !== undefined && this.progress() !== null);
}
