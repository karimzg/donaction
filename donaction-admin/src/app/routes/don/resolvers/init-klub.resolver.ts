import { ResolveFn } from '@angular/router';
import { inject } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { ENDPOINTS } from "@shared/utils/config/endpoints";
import { of } from "rxjs";
import { Klubr } from "@shared/utils/models/klubr";

export const initKlubResolver: ResolveFn<Klubr | undefined> = (route, state) => {
  const klubrUUIDInit = (route.queryParamMap.get('filterClubUuid') || undefined);
  return klubrUUIDInit ? getKlubrByUUID(klubrUUIDInit) : of(undefined);
};

const getKlubrByUUID = (klubrUUID: string) => {
  const http = inject(HttpClient);
  return http.get<Klubr>(environment.apiUrl + ENDPOINTS.KLUBR + '/' + klubrUUID);
}
