import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  KlubrMembre,
  KlubrMembreRole,
  KlubrMembreSwitchToAdminEditor,
  UserDetail,
} from '@shared/utils/models/user-details';
import { HttpClient } from '@angular/common/http';
import { ENDPOINTS } from '@shared/utils/config/endpoints';
import { environment } from '@environments/environment';
import { Klubr, UserLinkedTo } from '@shared/utils/models/klubr';
import { getPopulateQueryParam, getUserPopulateQueryParam, } from '@shared/utils/helpers/query-helpers';
import { ProfileService } from "@shared/services/profile.service";

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private http = inject(HttpClient);
  private profileService = inject(ProfileService);

  public getUserDetail(
    id: number,
    isFullPopulated: boolean
  ): Observable<UserDetail> {
    return this.http.get<UserDetail>(
      environment.apiUrl +
      ENDPOINTS.USER +
      id +
      getUserPopulateQueryParam()
    );
  }

  public switchToProfile(
    memberUuid: string,
  ): Observable<KlubrMembre> {
    return this.http.post<KlubrMembre>(
      environment.apiUrl +
      ENDPOINTS.SWITCH_TO_PROFILE +
      '/' +
      memberUuid,
      {}
    );
  }

  getKlubrDetail(slug: string): Observable<any> {
    return this.http.get<Klubr>(
      environment.apiUrl +
      ENDPOINTS.KLUBR_BY_SLUG +
      '/' +
      slug +
      getPopulateQueryParam(['logo'])
    );
  }

  filterKlubs(code: string, role?: KlubrMembreRole): Observable<{ data: Array<Klubr> }> {
    let codeField: string;
    switch (role) {
      case 'Admin':
        codeField = 'codeAdmin';
        break;
      case 'KlubMember':
        codeField = 'code';
        break;
      case 'NetworkLeader':
        codeField = 'codeNetwork';
        break;
      case 'KlubMemberLeader':
        codeField = 'codeLeader';
        break;
      default:
        codeField = 'code';
    }
    return this.http.get<{ data: Array<Klubr> }>(
      environment.apiUrl +
      ENDPOINTS.KLUBR +
      '/?' + getPopulateQueryParam(['logo']) + `&filters[${codeField}][$eq]=${code}`)
  }

  filterMembers(code: string): Observable<{ data: Array<KlubrMembre> }> {
    return this.http.get<{ data: Array<KlubrMembre> }>(
      environment.apiUrl +
      ENDPOINTS.MEMBER +
      '/?' + getPopulateQueryParam(['klubr.logo']) + '&filters[code][$eq]=' + code)
  }

  linkMemberToUser(code: string, uuid?: string): Observable<UserLinkedTo> {
    const request = {
      "data": {
        "userToLinkUuid": null
      }
    }
    return this.http.post<UserLinkedTo>(environment.apiUrl + ENDPOINTS.LINK_MEMBER_TO_USER + '/' + code, request);
  }

  public updateProfile(
    uuid: string,
    profile: Partial<KlubrMembre>
  ): Observable<KlubrMembre> {
    return this.profileService.updateProfile(uuid, profile);
  }

  public createProfile(
    profile: Partial<KlubrMembre>,
    additionalQueryParams?: string
  ): Observable<{ data: KlubrMembre }> {
    return this.profileService.createProfile(profile, ['avatar'], additionalQueryParams);
  }

  public updateKlub(
    uuid: string,
    klub: Partial<Klubr>
  ): Observable<Klubr> {
    return this.http.put<Klubr>(
      environment.apiUrl +
      ENDPOINTS.KLUBR +
      '/' +
      uuid +
      '/?populate[0]=logo&populate[1]=federationLink&populate[2]=klubrAffiliations',
      {
        data: {
          ...klub
        }
      }
    );
  }

  getKlubrHouseDetails(): Observable<any> {
    return this.http.get(environment.apiUrl + 'klubr-houses/full/8d0cce08-fa40-42a2-bf8c-678f5237775e')
  }

  updateKlubrHouseDetails(klubrHouseDetail: any): Observable<any> {
    return this.http.put(environment.apiUrl + 'klubr-houses/8d0cce08-fa40-42a2-bf8c-678f5237775e', klubrHouseDetail);
  }

  getKlubProjectDetails(uuid: string): Observable<any> {
    return this.http.get(environment.apiUrl + `klub-projets/${uuid}?populate=*?populate=*`)
  }

  updateKlubProjectDetails(uuid: string, klubProjectDetail: any): Observable<any> {
    return this.http.put(environment.apiUrl + 'klub-projets/${uuid}', klubProjectDetail);
  }

  switchToProfileAdminEditor(klubrUuid: string): Observable<KlubrMembreSwitchToAdminEditor> {
    return this.http.post<KlubrMembreSwitchToAdminEditor>(environment.apiUrl + ENDPOINTS.SWITCH_TO_ADMIN_EDITOR + '/' + klubrUuid, {});
  }
}
