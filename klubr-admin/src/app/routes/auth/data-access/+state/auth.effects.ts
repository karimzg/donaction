import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, of } from 'rxjs';
import { catchError, map, mergeMap, take, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { GetMeFailure, GetMeSuccess } from './auth.actions';
import { AuthService } from '../repositories/auth.service';
import { JwtService } from '@shared/services/jwt.service';
import { Router } from '@angular/router';
import { PROFILE_UUID } from '@shared/utils/config/global-settings';
import * as SharedActions from '@shared/data-access/+state/shared.actions';
import { Store } from '@ngrx/store';
import { UserDetail } from '@shared/utils/models/user-details';
// import { SocialAuthService } from '@abacritt/angularx-social-login';
import { environment } from "@environments/environment";
import { AuthFacade } from "./auth.facade";

@Injectable()
export class LoginEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private jwtService = inject(JwtService);
  private store = inject(Store);
  private router = inject(Router);
  // private socialAuthService = inject(SocialAuthService);
  private authFacade = inject(AuthFacade);

  isAuthenticated$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.isAuthenticated),
      map((isAuthenticated) =>
        AuthActions.isAuthenticatedSuccess(isAuthenticated)
      )
    )
  );

  IsAuthenticateSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.isAuthenticatedSuccess),
      filter(({isAuthenticated}) => isAuthenticated),
      mergeMap(() =>
        this.authService.getMe().pipe(
          map((me) => GetMeSuccess({me})),
          tap(({me}) => this.processUserProfile(me)),
          catchError((error) =>
            of(GetMeFailure({error: error?.error?.error}))
          ),
        )
      )
    )
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({identifier, password}) =>
        this.authService.authenticate(identifier, password).pipe(
          tap((user) => this.jwtService.saveToken(user.jwt)),
          map((user) => AuthActions.loginSuccess({user})),
          catchError((error) =>
            of(AuthActions.loginFailure({error: error?.error?.error}))
          ) // to be verfied
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      map(() => AuthActions.isAuthenticated({isAuthenticated: true}))
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        // if (this.authFacade.authMode() === 'angular') {
        //   this.socialAuthService.signOut();
        // }
        this.jwtService.removeToken();
      }),
      map(() => AuthActions.logoutSuccess()),
      tap(() => {
        console.log('Logout Success');
        if (this.authFacade.authMode() === 'angular') {
          this.router.navigate(['auth/login']);
        } else {
          window.location.href = environment.nextJsUrl + '?logout=true';
        }
      })
    )
  );

  GetMe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.GetMe), // Listen for a specific action
      take(1), // Ensure it's only dispatched once
      mergeMap(() =>
        this.authService.getMe().pipe(
          map((me) => GetMeSuccess({me})),
          catchError((error) => of(GetMeFailure({error: error?.error?.error})))
        )
      )
    )
  );

  ChangeMePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.changeMePassword),
      mergeMap(({currentPassword, password, passwordConfirmation}) =>
        this.authService
          .changeMePassword(currentPassword, password, passwordConfirmation)
          .pipe(
            map((user) => AuthActions.changeMePasswordSuccess({user})),
            catchError((error) =>
              of(
                AuthActions.changeMePasswordFailure({
                  error: error?.error?.error,
                })
              )
            ) // to be verfied
          )
      )
    )
  );

  UpdateMeInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateMeInfo),
      mergeMap(({id, userDetail}) =>
        this.authService.updateMeDetail(id, userDetail).pipe(
          map((userInfo) => AuthActions.updateMeInfoSuccess({userInfo})),
          catchError((error) =>
            of(AuthActions.updateMeInfoFailure({error: error?.error?.error}))
          ) // to be verfied
        )
      )
    )
  );
  Register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap((registerRequest) =>
        this.authService.register(registerRequest.registerRequest).pipe(
          tap((user) => this.jwtService.saveToken(user.jwt)),
          map((user) => AuthActions.registerSuccess({user})),
          catchError((error) =>
            of(AuthActions.registerFailure({error: error?.error?.error}))
          )
        )
      )
    )
  );
  RegisterSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      map(() => AuthActions.isAuthenticated({isAuthenticated: true}))
    )
  );

  private processUserProfile(me: UserDetail) {
    const profileUUIDStored =
      me?.last_member_profile_used || localStorage.getItem(PROFILE_UUID);
    const meProfileUUIDs = me?.klubr_membres?.map((membre) => membre.uuid);
    if (meProfileUUIDs) { // to be discussed with karim
      const currentProfileUUID =
        profileUUIDStored && meProfileUUIDs?.includes(profileUUIDStored)
          ? profileUUIDStored
          : meProfileUUIDs[0];
      const currentProfile = me?.klubr_membres?.find(
        (membre) => membre.uuid === currentProfileUUID
      );

      if (me?.last_member_profile_used !== currentProfileUUID) {
        currentProfileUUID && this.store.dispatch(
          SharedActions.SwitchToProfile({uuid: currentProfileUUID})
        );
      } else if (currentProfile) {
        this.store.dispatch(
          SharedActions.SetProfile({profile: currentProfile})
        );
      }
    }
  }

  GoogleRegister$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.googleRegister),
      mergeMap((registerRequest) =>
        this.authService.googleOAuthRegister(registerRequest.accountProvider, registerRequest.accessToken).pipe(
          tap((user) => this.jwtService.saveToken(user.jwt)),
          map((user) => AuthActions.registerSuccess({user})),
          catchError((error) =>
            of(AuthActions.registerFailure({error: error?.error?.error}))
          )
        )
      )
    )
  );
  GoogleRegisterSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.googleRegisterSuccess),
      map(() => AuthActions.isAuthenticated({isAuthenticated: true}))
    )
  );
}
