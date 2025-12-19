import { Component, effect, inject, Signal, signal, WritableSignal } from '@angular/core';
import {
  InformationsImageCardComponent
} from "@shared/components/medias/informations-image-card/informations-image-card.component";
import { environment } from "@environments/environment";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { HttpClient } from "@angular/common/http";
import { KlubProject, KlubrHouse } from "@shared/utils/models/klubr";

import { KlubrService } from "@shared/services/klubr.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { fadeAnimation } from "@shared/utils/animations/animations";

@Component({
  selector: 'app-communication',
  imports: [
    InformationsImageCardComponent
],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.scss',
  animations: [fadeAnimation]
})
export class CommunicationComponent {
  private http = inject(HttpClient);
  private sharedFacade = inject(SharedFacade);
  private klubrService = inject(KlubrService);
  public profile: Signal<KlubrMembre | null> = this.sharedFacade.profile;
  public klubrHouse: WritableSignal<KlubrHouse | undefined> = signal(undefined);
  public projectList: WritableSignal<KlubProject[]> = signal([]);
  public pagination: WritableSignal<number | undefined> = signal(undefined);

  constructor() {
    effect(() => {
      if (this.sharedFacade.profile()) {
        if (this.profile()?.klubr.uuid) {
          this.setProjectCard(this.profile()?.klubr.uuid);
          this.klubrHouse.set(undefined);
          this.klubrService.getKlubrHouseByKlubrUuid(this.profile()!.klubr.uuid).subscribe((data: any) => {
            this.klubrHouse.set(data.data[0]);
          });
        }
      }

    });
    this.sharedFacade.reloadCurrentRouteOnProfileChange().pipe(
      takeUntilDestroyed(),
    ).subscribe();
  }

  private setProjectCard(klubUuid: string | undefined) {
    this.getProjectsByKlubUuid(klubUuid).subscribe((data: any) => {
      this.projectList.set(data.data);
      this.pagination.set(data.pagination);
    });
  }

  private getProjectsByKlubUuid(klubUuid: string | undefined) {
    return this.http.get<KlubProject>(
      environment.apiUrl + 'klub-projets/byKlub/' + klubUuid + '?filters[status][$eq]=published'
    );
  }
}
