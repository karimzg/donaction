import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ENDPOINTS } from '../utils/config/endpoints';
import {
  addFilter,
  addGreaterLessFilter,
  addSubElementFilter,
  formatingDate,
  getQueryString,
  pagination
} from '../utils/helpers/query-helpers';
import { DonFilters } from "@app/routes/don/model/don-filters";
import { DonationDetails } from "../utils/models/donation-details";
import { ApiListResult } from "../utils/models/misc";
import { isArray, isNotNullOrUndefined } from "@shared/utils/helpers/type-helpers";

export const defaultDonSort = ['createdAt:desc'];
export const defaultDonPopulate = ['klubDonateur', 'klub_projet', 'klubr.logo'];
export const defaultDonWithAvatarPopulate = ['klubDonateur.logo', 'klubDonateur.avatar', 'klub_projet', 'klubr.logo'];

/* CLEANED ON 2024 12 28 */

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private http = inject(HttpClient)

  public getMyDon(page = 1, pageSize = 20): Observable<ApiListResult<DonationDetails>> {
    return this.http.get<ApiListResult<DonationDetails>>(
      environment.apiUrl +
      ENDPOINTS.MY_DONS + getQueryString([], [], undefined, defaultDonSort, pagination(page, pageSize)),
    );
  }

  public getDonByUuid(uuid: string, populateArray = defaultDonPopulate): Observable<DonationDetails> {
    return this.http.get<DonationDetails>(
      environment.apiUrl +
      ENDPOINTS.DON +
      `/${uuid}/` + getQueryString([],
        populateArray, undefined, defaultDonSort
      ),
    );
  }

  public getDonWithFilters(filters?: DonFilters, populateArray = defaultDonPopulate, additionalQueryParams?: string, sortArray = defaultDonSort, page = 1, pageSize = 20): Observable<ApiListResult<DonationDetails>> {
    const queryArray: Array<string> = [];
    if (filters !== undefined) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as keyof DonFilters];
        if (isNotNullOrUndefined(value)) {
          switch (key) {
            case ('klubrUUIDs'):
              (value as string[]).forEach((uuid) => {
                queryArray.push(addFilter('klubr', 'uuid', uuid));
              })
              break;
            case ('klubProject'):
              (value as string[]).forEach((uuid) => {
                console.log('FILTER klubProject', uuid);
                if (uuid !== undefined) {
                  if (uuid === 'notNull') {
                    queryArray.push(addFilter('klub_projet', '$notNull', 'true'));
                  } else if (uuid === null) {
                    queryArray.push(addFilter('klub_projet', '$null', 'true'));
                  } else {
                    queryArray.push(addSubElementFilter('klub_projet', 'uuid', '$eq', uuid));
                  }
                }
              })
              break;
            case ('invoice'):
              (value as string[]).forEach((uuid) => {
                if (uuid === null) {
                  queryArray.push(addFilter('invoice', '$null', 'true'));
                } else {
                  queryArray.push(addSubElementFilter('invoice', 'uuid', '$eq', uuid));
                }
              })
              break;
            case ('donationDate'):
              const dates = formatingDate(value as Date[]);
              queryArray.push(addGreaterLessFilter('datePaiment', dates[0] as string, dates[1]));
              break;
            case ('donationPrice'):
              if (isArray(value, 2) && Array.isArray(value)) {
                queryArray.push(addGreaterLessFilter('montant', value[0] as string, value[1] as string));
              }
              break;
            case ('donationStatus'):
              queryArray.push(addFilter('statusPaiment', '$eq', value as string));
              break;
            case ('contribution'):
              if (value === 'true') {
                queryArray.push(addFilter('contributionAKlubr', '$gt', '0'));
              } else {
                queryArray.push(addFilter(['$or', '0', 'contributionAKlubr'], '$eq', '0'));
                queryArray.push(addFilter(['$or', '1', 'contributionAKlubr'], '$null', 'true'));
              }
              break;
            case ('invoiceLineUuid'):
              queryArray.push(addSubElementFilter('invoice_line', 'uuid', '$eq', value as string));
              break;
            case ('searchParams'):
              if (typeof value === 'string' && value.length > 0) {
                queryArray.push(addFilter(['$or', '2', 'attestationNumber'], '$containsi', value));
                queryArray.push(addFilter(['$or', '3', 'klubDonateur', 'nom'], '$containsi', value));
                queryArray.push(addFilter(['$or', '4', 'klubDonateur', 'raisonSocial'], '$containsi', value));
                queryArray.push(addFilter(['$or', '5', 'uuid'], '$containsi', value));
              }
              break;
            default:
              break;
          }
        }
      });
    }
    return this.http.get<ApiListResult<DonationDetails>>(
      environment.apiUrl +
      ENDPOINTS.DON_RECEIVED +
      '/' + getQueryString(queryArray, populateArray, additionalQueryParams, sortArray, pagination(page, pageSize)),
    );
  }

  public getNotBilledKlubDon(): Observable<ApiListResult<DonationDetails>> {
    const queryArray: Array<string> = [];
    queryArray.push(addFilter('klub_projet', '$null', 'true'));
    queryArray.push(addFilter('invoice', '$null', 'true'));
    queryArray.push(addFilter('statusPaiment', '$eq', 'success'));
    return this.http.get<ApiListResult<DonationDetails>>(
      environment.apiUrl +
      ENDPOINTS.DON_RECEIVED +
      '/' + getQueryString(queryArray, defaultDonWithAvatarPopulate, undefined, defaultDonSort, pagination(1, 100)),
    );
  }

}
