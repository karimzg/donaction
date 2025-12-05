import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NextJsSession, User } from '../../model/user';
import { environment } from '@environments/environment';
import { ENDPOINTS } from '@shared/utils/config/endpoints'; // yp be changed in ts config
import { JwtService } from '@shared/services/jwt.service';
import { AuthFacade } from '../+state/auth.facade';
import { UserDetail } from '@shared/utils/models/user-details';
import { getUserPopulateQueryParam } from "@shared/utils/helpers/query-helpers";
import { RegisterRequest } from '../../model/registerRequest';
import { catchError, take, tap } from "rxjs/operators";

declare var gapi: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private jwtService = inject(JwtService);
  private authFacade = inject(AuthFacade);
  private http = inject(HttpClient);

  constructor() {
    this.checkAuthModeAndIfUserAuthentificated();
  }

  public getMe(): Observable<UserDetail> {
    return this.http.get<UserDetail>(
      environment.apiUrl +
      ENDPOINTS.USER +
      '/me' +
      getUserPopulateQueryParam()
    );
  }

  public updateMeDetail(
    id: string | number, userDetail: UserDetail
  ): Observable<UserDetail> {
    return this.http.put<UserDetail>(
      environment.apiUrl +
      ENDPOINTS.USER +
      '/' +
      id
      , userDetail
    );
  }

  public authenticate(identifier: string, password: string): Observable<User> {
    return this.http.post<User>(environment.apiUrl + ENDPOINTS.LOGIN, {
      identifier,
      password,
    });
  }

  public changeMePassword(currentPassword: string, passwordConfirmation: string, password: string): Observable<User> {
    return this.http.post<User>(environment.apiUrl + ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword,
      passwordConfirmation,
      password
    });
  }

  public register(registerRequest: RegisterRequest): Observable<User> {
    return this.http.post<User>(environment.apiUrl + ENDPOINTS.REGISTER, registerRequest);
  }

  public googleOAuthRegister(accountProvider: string, accessToken: string): Observable<User> {
    return this.http.get<User>(environment.apiUrl + `auth/${accountProvider}/callback?access_token=${accessToken}`);
  }

  checkAuthModeAndIfUserAuthentificated(): void {
    this.http.get<NextJsSession>((environment.env === "dev" ? "/" : environment.nextJsUrl) + `api/auth/session`).pipe(
      take(1),
      tap((res) => {
        this.authFacade.setAuthMode('nextJs');
        this.authFacade.setToken(res?.token || null);
        this.authFacade.setIsAuthenticated(!!res?.token);
      }),
      catchError((error) => {
        this.authFacade.setAuthMode('angular');
        this.authFacade.setToken(this.jwtService.getCookieToken());
        this.authFacade.setIsAuthenticated(!!this.jwtService.hasCookieToken());
        return of(undefined);
      })
    ).subscribe();
  }


}
