import { inject, Injectable } from '@angular/core';
import { DocumentType, Federation, Klubr, KlubrDocuments, KlubrHouse } from '../utils/models/klubr';
import { environment } from "@environments/environment";
import { ENDPOINTS } from "../utils/config/endpoints";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  addFilter,
  addSubElementFilter,
  getPopulateQueryParam,
  getQueryString,
  pagination,
  slugify
} from "../utils/helpers/query-helpers";
import { ApiListResult, ApiResult, ApiSimpleListResult } from "../utils/models/misc";
import { downloadPDF, openPDFInNewWindow } from "../utils/helpers/pdf-helpers";
import { KlubFilters } from "@app/routes/klub/model/klub-filters";
import { isNotNullOrUndefined } from "@shared/utils/helpers/type-helpers";
import { Actions, ofType } from "@ngrx/effects";
import * as SharedActions from "@shared/data-access/+state/shared.actions";
import { catchError, map, switchMap, take, tap } from "rxjs/operators";
import { InvalidateCacheService } from "@shared/services/invalidate-cache.service";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { ToastService } from "@shared/services/misc/toast.service";
import { AnalyticsService } from "@shared/services/analytics/analytics.service";

export const defaultKlubrSort = ['status:desc', 'createdAt:desc'];
export const defaultKlubrPopulate = ['klubr_house.couvertureMedia', 'logo'];
export const defaultKlubrForAdminPopulate = ['klubr_house', 'logo', 'klubr_info', 'klubr_document', 'federationLink'];
export const defaultKlubrHousePopulate = ['couvertureMedia'];
export const defaultKlubrHouseWithLogoPopulate = ['couvertureMedia', 'klubr.logo'];

/* CLEANED ON 2024 12 28 */

@Injectable({
  providedIn: 'root'
})
export class KlubrService {
  private http = inject(HttpClient);
  private invalidateCacheService = inject(InvalidateCacheService);
  private actions$ = inject(Actions);
  public sharedFacade = inject(SharedFacade);
  public toastService = inject(ToastService);
  public analyticsService = inject(AnalyticsService);

  public getKlubrHouseByKlubrUuid(klubrUuid: string, populateArray?: Array<string>): Observable<ApiResult<KlubrHouse>> {
    return this.http.get<ApiResult<KlubrHouse>>(
      environment.apiUrl +
      ENDPOINTS.KLUBR_HOUSE + getQueryString([addSubElementFilter('klubr', 'uuid', '$eq', klubrUuid)], populateArray)
    );
  }

  public getKlubsWithFilters(filters?: KlubFilters, populateArray = defaultKlubrPopulate, additionalQueryParams?: string, sortArray = defaultKlubrSort, page = 1, pageSize = 10): Observable<ApiListResult<Klubr>> {
    const queryArray: Array<string> = [];
    if (filters !== undefined) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as keyof KlubFilters];
        if (isNotNullOrUndefined(value)) {
          switch (key) {
            case ('klubrUUIDs'):
              (value as string[]).forEach((uuid) => {
                queryArray.push(addFilter('uuid', '$eq', uuid));
              })
              break;
            case ('status'):
              if (value === 'waiting_for_documents') {
                queryArray.push(
                  ...[
                    addSubElementFilter('klubr_document', 'justifDomicileDirigeant', '$null', 'true'),
                    addSubElementFilter('klubr_document', 'statutsAssociation', '$null', 'true'),
                    addSubElementFilter('klubr_document', 'ribAssociation', '$null', 'true'),
                    addSubElementFilter('klubr_document', 'justifDesignationPresident', '$null', 'true'),
                    addSubElementFilter('klubr_document', 'avisSituationSIRENE', '$null', 'true'),
                    addSubElementFilter('klubr_document', 'attestationAffiliationFederation', '$null', 'true')
                  ]);
              } else if (value === 'waiting_for_validation') {
                queryArray.push(addSubElementFilter('klubr_info', 'requiredDocsWaitingValidationCompletion', '$gt', '0'));
              } else {
                queryArray.push(addFilter('status', '$eq', value as string));
              }
              break;
            case ('completion'):
              queryArray.push(addSubElementFilter('klubr_info', 'requiredFieldsCompletion', '$eq', value as string));
              break;
            case ('sportType'):
              console.log(value);
              (value as string[]).forEach((sport) => {
                queryArray.push(addFilter('sportType', '$eq', sport));
              })
              break;
            case ('federation'):
              queryArray.push(addSubElementFilter('federationLink', 'id', '$eq', value as string));
              break;
            case ('documentsToValidate'):
              if (value as string === null) {
                break;
              } else if (value) {
                queryArray.push(addSubElementFilter('klubr_info', 'requiredDocsWaitingValidationCompletion', '$gt', '0'));
              } else {
                queryArray.push(addSubElementFilter('klubr_info', 'requiredDocsWaitingValidationCompletion', '$eq', '0'));
              }
              break;
            case ('searchParams'):
              if (typeof value === 'string' && value.length > 0) {
                queryArray.push(addFilter(['$or', '0', 'denomination'], '$containsi', value));
                queryArray.push(addFilter(['$or', '1', 'sportType'], '$containsi', value));
                queryArray.push(addFilter(['$or', '2', 'siegeSocialRegion'], '$containsi', value));
                queryArray.push(addFilter(['$or', '3', 'status'], '$containsi', value));
                queryArray.push(addFilter(['$or', '4', 'uuid'], '$containsi', value));
              }
              break;
            default:
              break;
          }
        }
      });
    }
    return this.http.get<ApiListResult<Klubr>>(
      environment.apiUrl +
      ENDPOINTS.KLUBR +
      '/' + getQueryString(queryArray, populateArray, additionalQueryParams, sortArray, pagination(page, pageSize)),
    );
  }

  public getKlubrByUuid(klubrUuid: string, populateArray = defaultKlubrPopulate): Observable<Klubr> {
    return this.http.get<Klubr>(
      environment.apiUrl +
      ENDPOINTS.KLUBR +
      '/' +
      klubrUuid + getQueryString([], populateArray),
    );
  }

  public updateKlubrHouse(
    uuid: string,
    klubrHouse: Partial<KlubrHouse>
  ): Observable<KlubrHouse> {
    return this.http.put<KlubrHouse>(
      environment.apiUrl +
      ENDPOINTS.KLUBR_HOUSE +
      '/' +
      uuid + getQueryString([], defaultKlubrHousePopulate),
      {
        data: {
          ...klubrHouse
        }
      }
    );
  }

  /*
  * DOCUMENTS
  * */
  public createKlubrDocuments(
    klubrUuid: string
  ): Observable<KlubrDocuments> {
    return this.http.post<KlubrDocuments>(
      environment.apiUrl +
      ENDPOINTS.KLUBR +
      '/' +
      klubrUuid +
      '/create-documents',
      {}
    );
  }

  public updateKlubrDocumentsValidation(
    uuid: string,
    documentType: DocumentType,
    validate: boolean,
  ): Observable<Klubr> {
    return this.http.put<Klubr>(
      environment.apiUrl +
      ENDPOINTS.KLUBR +
      '/' +
      uuid +
      '/documents' +
      '/validate',
      {
        data: {
          [documentType + 'Valide']: validate
        }
      }
    );
  }

  public downloadDocument(klubrUUid: string, documentType: DocumentType, documentName?: string, action: 'open' | 'download' = 'download', mimeType = 'application/pdf'): void {
    const extension = documentName?.split('.').pop() || '.pdf';
    const endpoint = environment.apiUrl + 'klubrs/' + klubrUUid + '/documents' + '/' + documentType;
    const headers = new HttpHeaders({
      'Content-Type': mimeType
    });
    this.http.get(endpoint, {headers: headers, responseType: 'blob', observe: 'response'}).pipe(
      action === 'open' ? openPDFInNewWindow() : downloadPDF(slugify(documentName || documentType) + '.' + extension),
    ).subscribe();
  }

  public getFederations(populateArray?: Array<string>): Observable<ApiSimpleListResult<Federation>> {
    const populateString = populateArray ? '&' + getPopulateQueryParam(populateArray) + '&pagination[pageSize]=100' : '?pagination[pageSize]=100';
    return this.http.get<ApiSimpleListResult<Federation>>(
      environment.apiUrl +
      ENDPOINTS.FEDERATION +
      populateString
    );
  }

  public toggleKlubState(klub?: Klubr, disable = false): Observable<Klubr> {
    const isCurrentKlub = !klub;
    if (isCurrentKlub) {
      klub = this.sharedFacade.currentKlub();
    }
    const path = `/${klub?.slug}`;
    const status = disable ? 'draft' : 'published';
    this.sharedFacade.updateProfileKlub(klub!.uuid, {status});
    return this.actions$.pipe(
      ofType(SharedActions.UpdateProfileKlubSuccess),
      map(({klub}) => klub),
      take(1),
      switchMap((klub) => this.invalidateCacheService.unvalidateCache([path], undefined).pipe(
        catchError((error) => {
          this.toastService.showErrorToast('Erreur', error.message);
          throw error;
        }),
        tap(() => this.toastService.showSuccessToast('Page rafraîchie', `La page ${environment.nextJsUrl + path} a été rafraîchie avec succès`)),
        map(() => klub),
        tap(() => this.analyticsService.trackEvent('ToogleKlubState', {
          customProps: {
            Action: `ToggleKlubState: ${klub.denomination} ${disable ? 'désactivé' : 'activé'}`,
          }
        }))
      )),
    );
  }
}
