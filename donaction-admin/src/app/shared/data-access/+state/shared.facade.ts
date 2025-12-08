import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as SharedActions from './shared.actions';
import * as fromShared from './shared.selectors';
import { KlubrMembre, KlubrMembreRole } from "@shared/utils/models/user-details";
import { HttpError } from "@shared/utils/models/codes-errors";
import * as AuthActions from "@app/routes/auth/data-access/+state/auth.actions";
import { Media } from "@shared/utils/models/media";
import { Klubr } from "@shared/utils/models/klubr";
import { distinctUntilChanged, tap } from "rxjs/operators";
import { filter, Observable, skip } from "rxjs";
import { Router } from "@angular/router";
import { SharedService } from "@shared/data-access/repositories/shared.service";
import { ToastService } from "@shared/services/misc/toast.service";

@Injectable({providedIn: 'root'})
export class SharedFacade {
  private store = inject(Store);
  private router = inject(Router);
  private sharedService = inject(SharedService);
  private toastService = inject(ToastService);

  readonly loading = this.store.selectSignal(fromShared.selectLoading);
  readonly loading$ = this.store.select(fromShared.selectLoading);
  readonly error = this.store.selectSignal(fromShared.selectError);
  readonly klubrDetails = this.store.selectSignal(fromShared.selectKlubrDetails);
  // readonly klubr = this.store.selectSignal(fromShared.selectKlubr);
  readonly profile = this.store.selectSignal(fromShared.selectProfile);
  readonly profile$ = this.store.select(fromShared.selectProfile);
  readonly profileChanged$ = this.store.select(fromShared.selectProfile).pipe(
    distinctUntilChanged((prev, curr) => prev?.uuid === curr?.uuid)
  );
  readonly currentKlub = this.store.selectSignal(fromShared.selectProfileKlub);
  readonly currentKlubInfosCompletion = this.store.selectSignal(fromShared.selectProfileKlubInfosCompletion);
  readonly currentKlubDocsCompletion = this.store.selectSignal(fromShared.selectProfileKlubDocsCompletion);
  readonly currentKlubDocsPendingCompletion = this.store.selectSignal(fromShared.selectProfileKlubDocsPendingCompletion);
  readonly currentKlubGlobaleCompletion = this.store.selectSignal(fromShared.selectProfileKlubGlobaleCompletion);
  readonly currentKlub$ = this.store.select(fromShared.selectProfileKlub);
  readonly isLoaded = this.store.selectSignal(fromShared.selectIsLoaded);
  readonly filteredMembers = this.store.selectSignal(fromShared.selectFilteredMembers);
  readonly filteredKlubs = this.store.selectSignal(fromShared.selectFilteredKlubs);
  readonly linkedUser = this.store.selectSignal(fromShared.linkedUser);
  readonly filteredMembersIsLoaded = this.store.selectSignal(fromShared.filteredMembersIsLoaded);
  readonly filteredKlubsIsLoaded = this.store.selectSignal(fromShared.filteredKlubsIsLoaded);

  getKlubrDetails(slug: string) {
    // this.store.dispatch(SharedActions.GetKlubrDetail({slug})) ;
  }

  filterKlubsByCode(code: string, role: KlubrMembreRole) {
    this.store.dispatch(SharedActions.FilterKlubs({code, role}));
  }

  emptyFilterKlubs() {
    this.store.dispatch(SharedActions.EmptyFilterKlubs());
  }

  switchToProfile(memberUuid: string) {
    this.store.dispatch(SharedActions.SwitchToProfile({uuid: memberUuid}));
  }

  filterMembersByCode(code: string) {
    this.store.dispatch(SharedActions.FilterMembers({code}));
  }

  emptyFilterMembers() {
    this.store.dispatch(SharedActions.EmptyFilterMembers());
  }

  linkMembersToUser(code: string, uuid?: string) {
    this.store.dispatch(SharedActions.LinkMemberToUser({code, uuidUser: uuid}));
  }

  updateProfile(uuid: string, profile: Partial<KlubrMembre>) {
    this.store.dispatch(SharedActions.updateProfile({uuid, profile}));
  }

  updateKlubInStore(klub: Klubr) {
    this.store.dispatch(SharedActions.UpdateProfileKlubSuccess({klub}));
  }


  updateProfileAvatar(profileUuid: string, avatar: Media) {
    this.store.dispatch(SharedActions.updateProfileAvatar({profileUuid, avatar}));
  }

  updateProfileInList(profile: Partial<KlubrMembre>) {
    this.store.dispatch(AuthActions.UpdateProfileInList({profile}));
  }

  updateProfileKlub(uuid: string, klub: Partial<Klubr>) {
    this.store.dispatch(SharedActions.UpdateProfileKlub({uuid, klub}));
  }

  setLoading(loading: boolean) {
    this.store.dispatch(SharedActions.SetLoading({loading}));
  }

  setError(error: HttpError) {
    this.store.dispatch(SharedActions.SetError({error}));
  }

  public reloadCurrentRouteOnProfileChange(): Observable<any> {
    return this.profileChanged$.pipe(
      skip(1),
      filter((profile: KlubrMembre | null) => !!profile),
      tap(() => this.reloadCurrentRoute())
    );
  }

  public reloadCurrentRoute() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentUrl]).then();
    });
  }

  public switchToProfileAdminEditor(klubrUuid: string) {
    this.sharedService.switchToProfileAdminEditor(klubrUuid).pipe().subscribe({
      next: (result: any) => {
        switch (result.status) {
          case 'alreadyLinkedToUserAndConnected':
            this.toastService.showWarnToast('Changement de profile impossible', 'Vous êtes déjà connecté avec ce compte');
            break;
          case 'alreadyLinkedToUser':
            this.switchToProfile(result.uuid);
            this.router.navigate(['/']);
            break;
          case 'alreadyExistingAdminEditorNotLinkedToUSer':
          case 'newAdminEditor':
            this.linkMembersToUser(result.code);
            break
        }
      }
    });
  }
}
