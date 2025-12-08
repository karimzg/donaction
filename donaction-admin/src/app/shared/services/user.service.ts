import { inject, Injectable } from '@angular/core';
import { UserDetail } from "@shared/utils/models/user-details";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { ENDPOINTS } from "@shared/utils/config/endpoints";
import { HttpClient } from "@angular/common/http";
import { ApiListResult } from "@shared/utils/models/misc";
import {
  addFilter,
  addGreaterLessFilter,
  addSubElementFilter,
  formatingDate,
  getQueryString,
  pagination
} from "@shared/utils/helpers/query-helpers";
import { isNotNullOrUndefined } from "@shared/utils/helpers/type-helpers";
import { UserFilters } from "@app/routes/users/model/user-filters";

export const defaultUserPopulate = ['role'];
export const defaultUserSort = ['createdAt:desc'];

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  public getUsersWithFilters(filters?: UserFilters, populateArray = defaultUserPopulate, additionalQueryParams?: string, sortArray = defaultUserSort, page = 1, pageSize = 9, klubrMember = false): Observable<ApiListResult<UserDetail>> {
    const queryArray: Array<string> = [];
    if (filters !== undefined) {
      Object.keys(filters).forEach((key, index) => {
        const value = filters[key as keyof UserFilters];
        if (isNotNullOrUndefined(value)) {
          switch (key) {
            case ('creationDate'):
              const dates = formatingDate(value as Date[]);
              queryArray.push(addGreaterLessFilter('lastLogin', dates[0] as string, dates[1]));
              break;
            case ('role'):
              queryArray.push(addSubElementFilter('role', 'name', '$eq', value as string));
              break;
            case ('profiles'):
              if (value === true) {
                queryArray.push(addFilter('klubr_membres', '$null', 'false'));
              } else {
                queryArray.push(addFilter('klubr_membres', '$null', 'true'));
              }
              break;
            case ('origin'):
              if (value) {
                queryArray.push(addFilter('origine', '$eq', value as string));
              }
              break;
            case ('searchParams'):
              if (typeof value === 'string' && value.length > 0) {
                queryArray.push(addFilter(['$or', '0', 'email'], '$containsi', value));
                queryArray.push(addFilter(['$or', '1', 'uuid'], '$containsi', value));
              }
              break;
            default:
              break;
          }
        }
      });
    }

    return this.http.get<ApiListResult<UserDetail>>(
      environment.apiUrl +
      ENDPOINTS.USER_PERMISSIONS + '/' +
      ENDPOINTS.USER + '/' +
      ENDPOINTS.STATS + '/' +
      getQueryString(queryArray, [...populateArray, klubrMember ? 'klubr_membres.klubr.logo' : ''], additionalQueryParams, sortArray, pagination(page, pageSize)),
    );
  }
}
