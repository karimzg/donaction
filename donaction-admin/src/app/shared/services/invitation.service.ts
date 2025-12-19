import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { merge, Observable } from "rxjs";
import { environment } from "@environments/environment";
import { ENDPOINTS } from "../utils/config/endpoints";

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private http = inject(HttpClient);

  constructor() {
  }

  public sendInvitationClub(clubUuid: string, emails: Array<string>): Observable<Array<boolean>> {
    return merge(
      ...emails.map(email => {
        return this.http.post<Array<boolean>>(
          environment.apiUrl + ENDPOINTS.KLUBR + '/' + clubUuid + '/send-invitation',
          {data: {email}}
        );
      })
    );
  }

  public sendInvitationProfile(profileclubUuid: string, emails: Array<string>): Observable<Array<boolean>> {
    return merge(
      ...emails.map(email => {
        return this.http.post<Array<boolean>>(
          environment.apiUrl + ENDPOINTS.MEMBER + '/' + profileclubUuid + '/send-invitation',
          {data: {email}}
        );
      })
    );
  }
}
