import { inject, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { ENDPOINTS } from "../utils/config/endpoints";
import { HttpClient } from "@angular/common/http";
import {
  addFilter,
  addSubElementFilter,
  getQueryString,
  getQueryStringPopulateOneLevel,
  pagination
} from "../utils/helpers/query-helpers";
import { KlubrMembre } from "../utils/models/user-details";
import { ProfileFilters } from "@app/routes/members/model/profile-filters";
import { ApiListResult } from "../utils/models/misc";
import { isNotNullOrUndefined } from "@shared/utils/helpers/type-helpers";

export const defaultProfileSort = ['createdAt:desc'];
export const defaultProfilePopulate = ['avatar'];

/* CLEANED ON 2024 12 28 */

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

  public getProfilesWithFilters(filters?: ProfileFilters, populateArray = defaultProfilePopulate, additionalQueryParams?: string, sortArray = defaultProfileSort, page = 1, pageSize = 9, populateOneLevel = false): Observable<ApiListResult<KlubrMembre>> {
    const queryArray: Array<string> = [];
    if (filters !== undefined) {
      Object.keys(filters).forEach((key, index) => {
        const value = filters[key as keyof ProfileFilters];
        if (isNotNullOrUndefined(value)) {
          switch (key) {
            case ('klubrUUIDs'):
              (value as string[]).forEach((uuid) => {
                queryArray.push(addSubElementFilter('klubr', 'uuid', '$eq', uuid));
              })
              break;
            case ('uuid'):
              queryArray.push(addFilter('uuid', '$eq', value as string));
              break;
            case ('account'):
              queryArray.push(addFilter('users_permissions_user', value ? '$notNull' : '$null', 'true'));
              break;
            case ('role'):
              if (value) {
                queryArray.push(addFilter('role', '$eq', value as string));
              }
              break;
            case ('searchParams'):
              if (typeof value === 'string' && value.length > 0) {
                queryArray.push(addFilter(['$or', '0', 'prenom'], '$containsi', value));
                queryArray.push(addFilter(['$or', '1', 'nom'], '$containsi', value));
                queryArray.push(addFilter(['$or', '2', 'fonction'], '$containsi', value));
                queryArray.push(addFilter(['$or', '3', 'uuid'], '$containsi', value));
              }
              break;
            default:
              break;
          }
        }
      });
    }

    return this.http.get<ApiListResult<KlubrMembre>>(
      environment.apiUrl +
      ENDPOINTS.MEMBER +
      '/' +
      getQueryString(queryArray, populateArray, additionalQueryParams, sortArray, pagination(page, pageSize), populateOneLevel),
    );
  }

  public updateProfile(uuid: string, profile: Partial<KlubrMembre>, populateArray = ['avatar']): Observable<KlubrMembre> {
    return this.http.put<any>(
      environment.apiUrl +
      ENDPOINTS.MEMBER +
      '/' +
      uuid +
      getQueryStringPopulateOneLevel([], populateArray),
      {
        data: {
          ...profile,
        }
      }
    );
  }

  public createProfile(profile: Partial<KlubrMembre>, populateArray = ['avatar'], additionalQueryParams?: string): Observable<{
    data: KlubrMembre
  }> {
    return this.http.post<{ data: KlubrMembre }>(
      environment.apiUrl +
      ENDPOINTS.MEMBER +
      getQueryStringPopulateOneLevel([], populateArray, additionalQueryParams),
      {
        data: {
          ...profile
        }
      }
    );
  }

  public deleteProfile(
    uuid: string,
  ): Observable<any> {
    return this.http.delete<any>(
      environment.apiUrl +
      ENDPOINTS.MEMBER +
      '/' +
      uuid
    );
  }

}
