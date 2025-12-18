import { Component, inject, input } from '@angular/core';
import { rxResource } from "@angular/core/rxjs-interop";
import { NEVER } from "rxjs";
import { StatsService } from "@shared/services/stats/stats.service";
import { KlubStatsCardComponent } from "@shared/components/klub/stats/klub-stats-card/klub-stats-card.component";
import { PermissionsService } from "@shared/services/permissions.service";
import { LottieComponent } from "ngx-lottie";
import { PercentPipe } from "@shared/pipes/misc/percent.pipe";

@Component({
  selector: 'app-klub-stats',
  imports: [
    KlubStatsCardComponent,
    LottieComponent,
    PercentPipe,
  ],
  templateUrl: './klub-stats.component.html',
  providers: [
    StatsService,
  ],
  styles: [
    `
      .grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        width: 100%;
      }
    `
  ]
})
export class KlubStatsComponent {
  private statsService = inject(StatsService);
  public permissionsService = inject(PermissionsService);
  displayAll = input<boolean>(false);
  klubUuid = input<string>();

  public klubrsStats = rxResource({
    params: () => ({
      uuid: this.klubUuid(),
      displayAll: this.displayAll(),
    }),
    stream: ({params}) =>
      params.displayAll
        ? this.statsService.getAllKlubsStats()
        : params.uuid ? this.statsService.getKlubStats(params.uuid) : NEVER
  });
}
