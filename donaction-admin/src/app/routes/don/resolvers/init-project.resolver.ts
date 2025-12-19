import { ResolveFn } from '@angular/router';
import { of } from "rxjs";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { KlubProject } from "@shared/utils/models/klubr";
import { environment } from "@environments/environment";
import { ENDPOINTS } from "@shared/utils/config/endpoints";

export const initProjectResolver: ResolveFn<KlubProject | undefined | null> = (route, state) => {
  const projectUUIDInit = (route.queryParamMap.get('filterProjectUuid') || undefined);
  return projectUUIDInit === 'null' ?
    of(null) : (projectUUIDInit === 'notNull' ? of({uuid: 'notNull'} as KlubProject) : (projectUUIDInit ? getProjectByUUID(projectUUIDInit) : of(undefined)));
};

const getProjectByUUID = (projectUUID: string) => {
  const http = inject(HttpClient);
  return http.get<KlubProject>(environment.apiUrl + ENDPOINTS.KLUB_PROJECT + '/' + projectUUID);
};
