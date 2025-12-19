import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, take, tap } from 'rxjs/operators';
import * as SharedActions from './shared.actions';
import { SharedService } from '../repositories/shared.service';
import { KLUBR_ID, PROFILE_UUID } from "@shared/utils/config/global-settings";
import * as AuthActions from "@app/routes/auth/data-access/+state/auth.actions";
import { GetMeFailure, GetMeSuccess } from "@app/routes/auth/data-access/+state/auth.actions";
import { AuthService } from '@app/routes/auth/data-access/repositories/auth.service';
import { Router } from "@angular/router";
import { ToastService } from "@shared/services/misc/toast.service";

@Injectable()
export class SharedEffects {
  private actions$ = inject(Actions);
  private sharedService = inject(SharedService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  getKlubrDetail$ = createEffect(() => this.actions$.pipe(
    ofType(SharedActions.GetKlubrDetail),
    mergeMap(({slug}) =>
      this.sharedService.getKlubrDetail(slug).pipe(
        map(klubrDetail => SharedActions.GetKlubrDetailSuccess({klubrDetail})),
        tap((klubrAction) => localStorage.setItem(KLUBR_ID, klubrAction.klubrDetail.slug)),
        tap((klubrDetail) => console.log('EFFECT klubrDetail', klubrDetail)),
        catchError((error) => of(SharedActions.GetKlubrDetailFailure({error: error?.error?.error})))  // to be verfied
      )
    )
  ));

  switchToProfile$ = createEffect(() => this.actions$.pipe(
    ofType(SharedActions.SwitchToProfile),
    mergeMap(({uuid}) =>
      this.sharedService.switchToProfile(uuid).pipe(
        take(1),
        tap((profile) => console.log('%cCALL EFFECT SwitchToProfile', 'color: blue', profile)),
        map(profile => SharedActions.SwitchToProfileSuccess({profile})),
        catchError((error) => of(SharedActions.SwitchToProfileFailure({error: error?.error?.error})))  // to be verfied
      )
    )
  ));

  switchToProfileSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SharedActions.SwitchToProfileSuccess),
    map(profileAction => SharedActions.SetProfile({profile: profileAction.profile})),
    map(profileAction => AuthActions.SetMeLastProfileUsed({profileUuid: profileAction.profile.uuid})),
    tap((profileUuidAction) => localStorage.setItem(PROFILE_UUID, profileUuidAction.profileUuid)),
    tap((profile) => console.log('EFFECT SwitchToProfile', profile)),
    mergeMap(() => this.authService.getMe().pipe(
      map(me => GetMeSuccess({me})),
      catchError((error) => of(GetMeFailure({error: error?.error?.error})))  // to be verfied
    )),
  ));

  filteredMembers$ = createEffect(() => this.actions$.pipe(
    ofType(SharedActions.FilterMembers),
    mergeMap(({code}) =>

      this.sharedService.filterMembers(code).pipe(
        map(members => SharedActions.FilterMembersSuccess({filteredMembers: members?.data})),
        catchError((error) => of(SharedActions.FilterMembersFailure({error: error?.error?.error})))  // to be verfied
      )
    )
  ));

  linkMemberToUser$ = createEffect(() => this.actions$.pipe(
    ofType(SharedActions.LinkMemberToUser),
    mergeMap((data) =>
      this.sharedService.linkMemberToUser(data.code, data.uuidUser).pipe(
        map(linkedUser => SharedActions.LinkMemberToUserSuccess({linkedUser})),
        catchError((error) => of(SharedActions.LinkMemberToUserFailure({error: error?.error?.error})))  // to be verfied
      )
    )
  ));

  linkMemberToUserSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SharedActions.LinkMemberToUserSuccess),
    map(({linkedUser}) => SharedActions.SwitchToProfile({uuid: linkedUser.uuid})),
    tap(() => this.router.navigate(['/'])),
  ));

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SharedActions.updateProfile),
      mergeMap(({uuid, profile}) =>
        this.sharedService.updateProfile(uuid, profile).pipe(
          map((profile) => SharedActions.updateProfileSuccess({profile})),
          catchError((error) =>
            of(SharedActions.updateProfileFailure({error: error?.error?.error}))
          )
        )
      )
    )
  );

  updateProfileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SharedActions.updateProfileSuccess),
      map(({profile}) => AuthActions.UpdateProfileInList({profile}))
    )
  );


  updateProfileKlub$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SharedActions.UpdateProfileKlub),
      mergeMap(({uuid, klub}) =>
        this.sharedService.updateKlub(uuid, klub).pipe(
          map((klub) => SharedActions.UpdateProfileKlubSuccess({klub})),
          catchError((error) =>
            of(SharedActions.UpdateProfileKlubFailure({error: error?.error?.error}))
          )
        )
      )
    )
  );

  updateProfileSuccessKlub$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SharedActions.UpdateProfileKlubSuccess),
      tap(() => this.toastService.showSuccessToast('Succès', 'Le Klub a été mis à jour')),
      map(({klub}) => AuthActions.UpdateKlubInList({klub}))
    )
  );

  filteredKlubs$ = createEffect(() => this.actions$.pipe(
    ofType(SharedActions.FilterKlubs),
    mergeMap(({code, role}) =>
      this.sharedService.filterKlubs(code, role).pipe(
        map(members => SharedActions.FilterKlubsSuccess({filteredKlubs: members?.data})),
        catchError((error) => of(SharedActions.FilterKlubsFailure({error: error?.error?.error})))  // to be verfied
      )
    )
  ));
}
