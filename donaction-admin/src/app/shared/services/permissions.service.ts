import { inject, Injectable, Signal } from '@angular/core';
import {
  KlubrMembre,
  KlubrMembreRole,
  MEMBER_ROLES,
  USER_ROLES,
  UserDetail,
  UserRole
} from "../utils/models/user-details";
import { Store } from "@ngrx/store";
import * as fromAuth from "@app/routes/auth/data-access/+state/auth.selectors";
import * as fromShared from "@shared/data-access/+state/shared.selectors";
import { filter, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { toSignal } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private store = inject(Store);

  constructor() {
  }

  private meNotNull$: Observable<UserDetail> = this.store.select(fromAuth.selectMe).pipe(
    filter((user: UserDetail | null | undefined): user is UserDetail => !!user)
  );
  // private meNotNullSignal: Signal<UserDetail | undefined> = toSignal(this.meNotNull$);

  private profileNotNull$: Observable<KlubrMembre> = this.store.select(fromShared.selectProfile).pipe(
    filter((profile: KlubrMembre | null | undefined): profile is KlubrMembre => !!profile)
  );
  private profileNotNullSignal: Signal<KlubrMembre | undefined> = toSignal(this.profileNotNull$);
  // private klubrNotNull$: Observable<Klubr> = this.store.select(fromShared.selectProfile).pipe(
  //   filter((profile: KlubrMembre | null | undefined): profile is KlubrMembre => !!profile),
  //   map((profile: KlubrMembre) => profile.klubr),
  // );

  public roleChanged$ = this.meNotNull$.pipe(map((user: UserDetail) => user.role));

  public isAdmin = (user: UserDetail): boolean => user?.role.name === USER_ROLES.Admin.name;
  public isAdmin$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isAdmin(user)));
  public isAdminSignal: Signal<boolean | undefined> = toSignal(this.isAdmin$);
  // TODO: Fix Signals
  // public isAdminSignal$: Signal<boolean> = computed(() => !!this.me() && this.isAdmin(this.me() as UserDetail));

  public isAdminEditor = (user: UserDetail) => user.role.name === USER_ROLES.AdminEditor.name;
  public isAdminEditor$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isAdminEditor(user)));
  public isAtLeastAdminEditor = (user: UserDetail) => USER_ROLES[user.role.name].weight >= USER_ROLES.AdminEditor.weight;
  public isAtLeastAdminEditor$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isAtLeastAdminEditor(user)));
  public isAtLeastAdminEditorSignal: Signal<boolean | undefined> = toSignal(this.isAtLeastAdminEditor$);

  public isNetwork = (user: UserDetail) => user.role.name === USER_ROLES.NetworkLeader.name;
  public isNetwork$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isNetwork(user)));
  public isAtLeastNetwork = (user: UserDetail) => USER_ROLES[user.role.name].weight >= USER_ROLES.NetworkLeader.weight;
  public isAtLeastNetwork$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isAtLeastNetwork(user)));

  public isLeader = (user: UserDetail) => user.role.name === USER_ROLES.KlubMemberLeader.name;
  public isLeader$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isLeader(user)));
  public isAtLeastLeader = (user: UserDetail) => USER_ROLES[user.role.name].weight >= USER_ROLES.KlubMemberLeader.weight;
  public isAtLeastLeader$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isAtLeastLeader(user)));
  public isAtLeastLeaderSignal: Signal<boolean | undefined> = toSignal(this.isAtLeastLeader$);

  public isMember = (user: UserDetail) => user?.role.name === USER_ROLES.KlubMember.name;
  public isMember$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isMember(user)));
  public isAtLeastMember = (user: UserDetail) => USER_ROLES[user.role.name].weight >= USER_ROLES.KlubMember.weight;
  public isAtLeastMember$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isAtLeastMember(user)));

  public isAuthenticated = (user: UserDetail) => user.role.name === USER_ROLES.Authenticated.name;
  public isAuthenticated$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isAuthenticated(user)));
  public isAtLeastAuthenticated = (user: UserDetail) => USER_ROLES[user.role.name].weight >= USER_ROLES.Authenticated.weight;
  public isAtLeastAuthenticated$: Observable<boolean> = this.meNotNull$.pipe(map((user: UserDetail) => this.isAtLeastAuthenticated(user)));

  /* PROFIL */

  public memberIsGreaterThan = (role: KlubrMembreRole) => this.profileNotNullSignal()
    && MEMBER_ROLES[this.profileNotNullSignal()!.role].weight > MEMBER_ROLES[role].weight;
  public memberIsAtLeast = (role: KlubrMembreRole) => this.profileNotNullSignal()
    && MEMBER_ROLES[this.profileNotNullSignal()!.role].weight >= MEMBER_ROLES[role].weight;

  public memberIsAdmin = (member: KlubrMembre) => member.role === MEMBER_ROLES.Admin.name;
  public memberIsAdmin$: Observable<boolean> = this.profileNotNull$.pipe(map((profile: KlubrMembre) => this.memberIsAdmin(profile)));
  public memberIsAdminSignal: Signal<boolean | undefined> = toSignal(this.memberIsAdmin$);

  public memberIsAtLeastAdmin = (member: KlubrMembre) => MEMBER_ROLES[member.role].weight >= MEMBER_ROLES.Admin.weight;
  public memberIsAtLeastAdmin$: Observable<boolean> = this.profileNotNull$.pipe(map((profile: KlubrMembre) => this.memberIsAtLeastAdmin(profile)));
  public memberIsAtLeastAdminSignal: Signal<boolean | undefined> = toSignal(this.memberIsAtLeastAdmin$);

  public memberIsAdminEditor = (member: KlubrMembre) => member.role === MEMBER_ROLES.AdminEditor.name;
  public memberIsAdminEditor$: Observable<boolean> = this.profileNotNull$.pipe(map((profile: KlubrMembre) => this.memberIsAdminEditor(profile)));
  public memberIsAdminEditorSignal: Signal<boolean | undefined> = toSignal(this.memberIsAdminEditor$);

  public memberIsAtLeastAdminEditor = (member: KlubrMembre) => MEMBER_ROLES[member.role].weight >= MEMBER_ROLES.AdminEditor.weight;
  public memberIsAtLeastAdminEditor$: Observable<boolean> = this.profileNotNull$.pipe(map((profile: KlubrMembre) => this.memberIsAtLeastAdminEditor(profile)));
  public memberIsAtLeastAdminEditorSignal: Signal<boolean | undefined> = toSignal(this.memberIsAtLeastAdminEditor$);

  public memberIsNetwork = (member: KlubrMembre) => member.role === MEMBER_ROLES.NetworkLeader.name;
  public memberIsNetwork$: Observable<boolean> = this.profileNotNull$.pipe(map((profile: KlubrMembre) => this.memberIsNetwork(profile)));
  public memberIsNetworkSignal: Signal<boolean | undefined> = toSignal(this.memberIsNetwork$);

  public memberIsAtLeastNetwork = (member: KlubrMembre) => MEMBER_ROLES[member.role].weight >= MEMBER_ROLES.NetworkLeader.weight;
  public memberIsAtLeastNetwork$: Observable<boolean> = this.profileNotNull$.pipe(map((profile: KlubrMembre) => this.memberIsAtLeastNetwork(profile)));
  public memberIsAtLeastNetworkSignal: Signal<boolean | undefined> = toSignal(this.memberIsAtLeastNetwork$);

  public memberIsLeader = (member: KlubrMembre) => member.role === MEMBER_ROLES.KlubMemberLeader.name;
  public memberIsLeader$: Observable<boolean> = this.profileNotNull$.pipe(map((profile: KlubrMembre) => this.memberIsLeader(profile)));
  public memberIsLeaderSignal: Signal<boolean | undefined> = toSignal(this.memberIsLeader$);

  public memberIsAtLeastLeader = (member: KlubrMembre) => MEMBER_ROLES[member.role].weight >= MEMBER_ROLES.KlubMemberLeader.weight;
  public memberIsAtLeastLeader$: Observable<boolean> = this.profileNotNull$.pipe(map((profile: KlubrMembre) => this.memberIsAtLeastLeader(profile)));
  public memberIsAtLeastLeaderSignal: Signal<boolean | undefined> = toSignal(this.memberIsAtLeastLeader$);

  public memberIsMember = (member: KlubrMembre) => member.role === MEMBER_ROLES.KlubMember.name;
  public memberIsMember$: Observable<boolean> = this.profileNotNull$.pipe(map((profile: KlubrMembre) => this.memberIsMember(profile)));
  public memberIsMemberSignal: Signal<boolean | undefined> = toSignal(this.memberIsMember$);

  public memberIsAtLeastMember = (member: KlubrMembre) => MEMBER_ROLES[member.role].weight >= MEMBER_ROLES.KlubMember.weight;
  public memberIsAtLeastMember$: Observable<boolean> = this.profileNotNull$.pipe(map((profile: KlubrMembre) => this.memberIsAtLeastMember(profile)));
  public memberIsAtLeastMemberSignal: Signal<boolean | undefined> = toSignal(this.memberIsAtLeastMember$);

  /* KLUB USER */
  public isKlubrNetwork = (user: UserDetail, klubrUuid: string) => user.klubr_membres.some(m => this.memberIsNetwork(m) && m.klubr?.uuid === klubrUuid);
  public isKlubrNetwork$ = (klubrUuid: string) => this.meNotNull$.pipe(
    map((user) => this.isKlubrNetwork(user, klubrUuid))
  );
  public isKlubrLeader = (user: UserDetail, klubrUuid: string) => user.klubr_membres.some(m => this.memberIsLeader(m) && m.klubr?.uuid === klubrUuid);
  public isKlubrLeader$ = (klubrUuid: string) => this.meNotNull$.pipe(
    map((user) => this.isKlubrLeader(user, klubrUuid))
  );
  public isAtLeastKlubrLeader = (user: UserDetail, klubrUuid: string) => user.klubr_membres.some(m => this.memberIsAtLeastLeader(m) && m.klubr?.uuid === klubrUuid);
  public isAtLeastKlubrLeader$ = (klubrUuid: string) => this.meNotNull$.pipe(
    map((user) => this.isAtLeastKlubrLeader(user, klubrUuid))
  );
  public isKlubrMember = (user: UserDetail, klubrUuid: string) => user.klubr_membres.some(m => this.memberIsMember(m) && m.klubr?.uuid === klubrUuid);
  public isKlubrMember$ = (klubrUuid: string) => this.meNotNull$.pipe(
    map((user) => this.isKlubrMember(user, klubrUuid))
  );
  public isAtLeastKlubrMember = (user: UserDetail, klubrUuid: string) => user.klubr_membres.some(m => this.memberIsAtLeastMember(m) && m.klubr?.uuid === klubrUuid);
  public isAtLeastKlubrMember$ = (klubrUuid: string) => this.meNotNull$.pipe(
    map((user) => this.isAtLeastKlubrMember(user, klubrUuid))
  );

  public roleIsGreaterThan = (role1: UserRole, role2: UserRole) => USER_ROLES[role1]?.weight > USER_ROLES[role2]?.weight;
  public roleIsAtLeast = (role1: UserRole, role2: UserRole) => USER_ROLES[role1]?.weight >= USER_ROLES[role2]?.weight;
  public roleIsEqualTo = (role1: UserRole, role2: UserRole) => USER_ROLES[role1]?.weight === USER_ROLES[role2]?.weight;
}
