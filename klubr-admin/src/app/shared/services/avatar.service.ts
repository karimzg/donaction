import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { ENDPOINTS } from "../utils/config/endpoints";
import { Avatar } from "../utils/models/media";
import { KlubrMembre } from "../utils/models/user-details";
import { CachingService } from "./caching.service";

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private http = inject(HttpClient);
  private cachingService = inject(CachingService);

  constructor() {
  }

  public getAvatar(type: 'women' | 'men'): Observable<Array<Avatar>> {
    const endpoint = environment.apiUrl + ENDPOINTS.AVATAR + '/' + type;
    const request = this.http.get<Array<Avatar>>(endpoint);
    return this.cachingService.cacheObservable<Array<Avatar>>(endpoint, request);
  }

  public newMediaProfileFile(profileUuid: string, formData: FormData): Observable<KlubrMembre> {
    return this.http.post<KlubrMembre>(
      environment.apiUrl +
      ENDPOINTS.MEDIAS_PROFILE +
      '/' +
      profileUuid +
      '/files',
      formData,
    );
  }

}
