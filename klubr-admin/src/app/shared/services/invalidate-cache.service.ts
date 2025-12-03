import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { ENDPOINTS } from "../utils/config/endpoints";

@Injectable({
  providedIn: 'root'
})
export class InvalidateCacheService {
  private http = inject(HttpClient);

  headers: HttpHeaders = this.setBasicAuth('klubr', 'klubrprod');

  setBasicAuth(username: string, password: string): HttpHeaders {
    const basicAuth = 'Basic ' + btoa(`${username}:${password}`);
    return new HttpHeaders({
      'Authorization': basicAuth
    });
  }

  public unvalidateCache(paths?: Array<string>, tags?: Array<string>):
    Observable<{ message: { paths?: string, tags?: string }, TagsEnum: any }> {
    return this.http.post<{ message: { paths?: string, tags?: string }, TagsEnum: any }>(
      (environment.env === "dev" ? "/" : environment.nextJsUrl) + ENDPOINTS.REVALIDATE,
      {
        paths,
        tags
      },
      {
        headers: this.headers
      }
    );
  }
}
