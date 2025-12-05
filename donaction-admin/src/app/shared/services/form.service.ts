import { inject, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { ENDPOINTS } from "../utils/config/endpoints";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private http = inject(HttpClient);

  constructor() {
  }

  public createContactForm(email: string, object: string, msg: string, token: string, origin: string): Observable<{
    data: any
  }> {
    return this.http.post<{ data: any }>(
      environment.apiUrl +
      ENDPOINTS.CONTACTS,
      {
        data: {
          object: object,
          msg: msg,
          email: email,
          formToken: token,
          origin: origin
        }
      }
    );
  }
}
