// login.facade.ts
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { GetMe } from './auth.actions';
import * as fromAuth from './auth.selectors';
import { AuthMode, Credentials } from '../../model/user';
import { KlubrMembre, UserDetail } from '@shared/utils/models/user-details';
import { asapScheduler, filter } from "rxjs";
import { RegisterRequest } from '../../model/registerRequest';
import { distinctUntilChanged } from "rxjs/operators";
import { toSignal } from "@angular/core/rxjs-interop";
import { Klubr } from "@shared/utils/models/klubr";

@Injectable({providedIn: 'root'})
export class AuthFacade {

  constructor(
    private store: Store,
  ) {
  }

  readonly loading = toSignal(this.store.select(fromAuth.selectLoading).pipe(distinctUntilChanged()));
  readonly error = this.store.selectSignal(fromAuth.selectError);
  readonly authMode = this.store.selectSignal(fromAuth.selectAuthMode);
  readonly token = this.store.selectSignal(fromAuth.selectToken);
  readonly token$ = this.store.select(fromAuth.selectToken);
  readonly me = this.store.selectSignal(fromAuth.selectMe);
  readonly me$ = this.store.select(fromAuth.selectMe);
  readonly isAuthenticated = this.store.selectSignal(fromAuth.selectAuthenticated);
  readonly isAuthenticated$ = this.store.select(fromAuth.selectAuthenticated).pipe(filter(isAuthenticated => isAuthenticated !== undefined));
  readonly isLoaded = this.store.selectSignal(fromAuth.selectIsLoaded);
  readonly isChangePassIsLoaded = this.store.selectSignal(fromAuth.selectIsPassWordUpdateLoaded);

  public setAuthMode(authMode: AuthMode) {
    this.store.dispatch(AuthActions.setAuthMode({authMode}));
  }

  public setToken(token: string | null) {
    this.store.dispatch(AuthActions.setToken({token}));
  }

  public login(credentials: Credentials) {
    this.store.dispatch(AuthActions.login(credentials));
  }

  public logout() {
    this.store.dispatch(AuthActions.logout());
  }

  public setIsAuthenticated(isAuthenticated: boolean): void {
    asapScheduler.schedule(() => this.store.dispatch(AuthActions.isAuthenticated({isAuthenticated})));
  }

  public getMe() {
    asapScheduler.schedule(() => this.store.dispatch(GetMe()));
  }

  public updateMeDetails(id: string | number, userDetail: UserDetail) {
    this.store.dispatch(AuthActions.updateMeInfo({id, userDetail}));
  }

  public updateProfileInList(uuid: string, profile: Partial<KlubrMembre>) {
    this.store.dispatch(AuthActions.UpdateProfileInList({profile: {uuid, ...profile}}));
  }

  public updateKlubInList(uuid: string, klub: Partial<Klubr>) {
    this.store.dispatch(AuthActions.UpdateKlubInList({klub: {uuid, ...klub}}));
  }

  public updateMePassword({currentPassword, password, passwordConfirmation}: {
    currentPassword: string,
    password: string,
    passwordConfirmation: string
  }) {
    this.store.dispatch(AuthActions.changeMePassword({currentPassword, password, passwordConfirmation}));
  }

  public register(registerRequest: RegisterRequest) {
    this.store.dispatch(AuthActions.register({registerRequest}));
  }

  public googleOAuthRegister(accountProvider: string, accessToken: string): void {
    this.store.dispatch(AuthActions.googleRegister({accountProvider, accessToken}));
  }

}
