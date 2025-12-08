import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiListResult } from "../utils/models/misc";
import {
  addFilter,
  addGreaterEqualFilter,
  addSubElementFilter,
  addSubSubElementFilter,
  formatDate,
  getQueryString,
  pagination
} from "../utils/helpers/query-helpers";
import { environment } from "@environments/environment";
import { ENDPOINTS } from "../utils/config/endpoints";
import { KlubProject, TmplProjectLibrary } from "../utils/models/klubr";
import { ProjectFilters } from "@app/routes/project/model/project-filters";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { isBoolean, isNotNullOrUndefined } from "@shared/utils/helpers/type-helpers";

export const defaultProjectSort = ['status:desc', 'createdAt:desc'];
export const defaultProjectPopulate = ['couverture', 'klubr_membre.avatar', 'klubr', 'template_projects_category.template_projects_library.klubr.logo'];
export const defaultProjectResolverPopulate = ['couverture', 'klubr_membre.avatar', 'klubr', 'template_projects_category.template_projects_library', 'invoice_line', 'contenu.image', 'realisations.image'];
export const defaultProjectUpdatePopulate = ['klubr', 'klubr_membre', 'contenu', 'realisations'];

/* CLEANED ON 2024 12 28 */

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);

  public getProjectsWithFilters(filters?: ProjectFilters, populateArray = defaultProjectPopulate, additionalQueryParams?: string, sortArray = defaultProjectSort, page = 1, pageSize = 9): Observable<ApiListResult<KlubProject>> {
    const queryArray: Array<string> = [];
    if (filters !== undefined) {
      Object.keys(filters).forEach((key, index) => {
        const value = filters[key as keyof ProjectFilters];
        if (isNotNullOrUndefined(value)) {
          switch (key) {
            case ('klubrUUIDs'):
              (value as string[]).forEach((uuid) => {
                queryArray.push(addSubElementFilter('klubr', 'uuid', '$eq', uuid));
              })
              break;
            case ('isTemplate'):
              if (isBoolean(value)) {
                queryArray.push(addFilter('isTemplate', '$eq', value.toString()));
              }
              break;
            case ('status'):
              (value as string[]).forEach((val) => {
                queryArray.push(addFilter('status', '$eq', val as string));
              })
              break;
            case('member'):
              queryArray.push(addSubElementFilter('klubr_membre', 'uuid', '$eq', (value as Partial<KlubrMembre>).uuid!));
              break;
            case('isFromTemplate'):
              if (isBoolean(value)) {
                queryArray.push(addFilter('isFromTemplate', '$eq', value.toString()));
              }
              break;
            case('projectLibrary'):
              queryArray.push(addSubSubElementFilter('template_projects_category', 'template_projects_library', 'uuid', '$eq', (value as Partial<TmplProjectLibrary>).uuid!));
              break;
            case ('invoiceLines'):
              (value as string[]).forEach((uuid) => {
                if (uuid === null) {
                  queryArray.push(addFilter('invoice_line', '$null', 'true'));
                } else if (uuid === 'notNull') {
                  queryArray.push(addFilter('invoice_line', '$notNull', 'true'));
                } else {
                  queryArray.push(addSubElementFilter('invoice_line', 'uuid', '$eq', uuid));
                }
              })
              break;
            case ('limitDate'):
              queryArray.push(addGreaterEqualFilter('dateLimiteFinancementProjet', formatDate((value as Date), false)));
              break;
            case ('invoicePeriod'):
              (value as string[]).forEach((period) => {
                queryArray.push(addSubSubElementFilter('invoice_line', 'invoice', 'billingPeriodSmall', '$eq', period));
              })
              break;
            case ('searchParams'):
              if (typeof value === 'string' && value.length > 0) {
                queryArray.push(addFilter(['$or', '0', 'titre'], '$containsi', value));
                queryArray.push(addFilter(['$or', '1', 'presentationTitre'], '$containsi', value));
                queryArray.push(addFilter(['$or', '2', 'slug'], '$containsi', value));
                queryArray.push(addFilter(['$or', '3', 'uuid'], '$containsi', value));
              }
              break;
            default:
              break;
          }
        }
      });
    }

    return this.http.get<ApiListResult<KlubProject>>(
      environment.apiUrl +
      ENDPOINTS.KLUB_PROJECT +
      '/' +
      getQueryString(queryArray, populateArray, additionalQueryParams, sortArray, pagination(page, pageSize)),
    );
  }

  public getProject(uuid: string, additionalQueryParams?: string): Observable<KlubProject> {
    return this.http.get<KlubProject>(
      environment.apiUrl +
      ENDPOINTS.KLUB_PROJECT +
      '/' + uuid + getQueryString([], defaultProjectResolverPopulate, additionalQueryParams),
    );
  }

  public updateProject(uuid: string, project: Partial<KlubProject>): Observable<KlubProject> {
    return this.http.put<any>(
      environment.apiUrl +
      ENDPOINTS.KLUB_PROJECT +
      '/' + uuid + getQueryString([], defaultProjectUpdatePopulate),
      {
        data: {
          ...project,
        }
      }
    );
  }

  public createProject(project: Partial<KlubProject>): Observable<{ data: KlubProject }> {
    return this.http.post<{ data: KlubProject }>(
      environment.apiUrl +
      ENDPOINTS.KLUB_PROJECT +
      '/' + getQueryString([], defaultProjectUpdatePopulate),
      {
        data: {
          ...project,
        }
      }
    );
  }

  public getProjectTmplLibraries(klubAffiliatesUuid: Array<string>, additionalQueryParams?: string): Observable<ApiListResult<TmplProjectLibrary>> {
    const queryArray: Array<string> = klubAffiliatesUuid.map((klubAffiliateUuid, index) => `filters[klubr][uuid][$in][${index}]=${klubAffiliateUuid}`);
    queryArray.push('populate[template_projects_categories][populate][klub_projets][populate][couverture]=true&populate[klubr][populate][logo]=true');
    return this.http.get<ApiListResult<TmplProjectLibrary>>(
      environment.apiUrl +
      ENDPOINTS.PROJECT_TMPL_LIBRARY +
      '/' + getQueryString(queryArray, [], additionalQueryParams, ['weight:desc'], undefined, true),
    );
  }

  public getOwnProjectTmplLibraries(tmplLibrairiesUUid: Array<string>, additionalQueryParams?: string): Observable<ApiListResult<TmplProjectLibrary>> {
    const queryArray: Array<string> = tmplLibrairiesUUid.map((tmplLibrairyUUid, index) => `filters[uuid][$in][${index}]=${tmplLibrairyUUid}`);

    return this.http.get<ApiListResult<TmplProjectLibrary>>(
      environment.apiUrl +
      ENDPOINTS.PROJECT_TMPL_LIBRARY +
      '/' + getQueryString(queryArray, ['klubr', 'klubr.logo', 'template_projects_categories.klub_projets.couverture'], additionalQueryParams, ['weight:desc']),
    );
  }

  public pathsToUnvalidateDataRequest(project: KlubProject): string[] {
    return project.klubr?.slug ? [
      `/${project.klubr.slug}/nos-projets/${project.slug}`,
      `/${project.klubr.slug}/nos-projets`,
      `/${project.klubr.slug}`,
    ] : [];
  }
}
