import { Component, inject, signal, WritableSignal } from '@angular/core';
import { PermissionsService } from "@shared/services/permissions.service";
import {
  DropdownKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-filter.component";
import { KlubStatsComponent } from "@shared/components/klub/stats/klub-stats/klub-stats.component";

@Component({
  selector: 'app-stats',
  imports: [
    DropdownKlubFilterComponent,
    KlubStatsComponent
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {
  protected permissionService = inject(PermissionsService);

  public klubrFilterUuid: WritableSignal<string | undefined> = signal(undefined);

  setKlubrFilterUuid(uuid: string) {
    this.klubrFilterUuid.set(uuid);
  }
}
