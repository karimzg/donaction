import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { KlubrStats } from "@shared/utils/models/klubr";

@Injectable()
export class StatsService {
  public http = inject(HttpClient);

  public getAllKlubsStats() {
    return this.http.get<KlubrStats>(`${environment.apiUrl}klubrs/stats-all`);
  }

  public getKlubStats(uuid: string) {
    return this.http.get<KlubrStats>(`${environment.apiUrl}klubrs/${uuid}/stats`);
  }
}
