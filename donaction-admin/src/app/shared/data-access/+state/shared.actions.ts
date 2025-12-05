import { createAction, props } from '@ngrx/store';
import { HttpError } from '@shared/utils/models/codes-errors';
import { KlubrMembre, KlubrMembreRole } from "@shared/utils/models/user-details";
import { Klubr, UserLinkedTo } from '@shared/utils/models/klubr';
import { CacheContent } from "@shared/utils/models/cache";
import { Media } from "@shared/utils/models/media";

enum SharedActionTypes {

  SetLoading = '[Shared] Set Loading Action',
  SetError = '[Shared] Set Error Action',

  SetProfile = '[Shared/Profile] Set Action ',

  SwitchToProfile = '[Shared/Profile] Switch To Action ',
  SwitchToProfileSuccess = '[Shared/Profile] Switch To Action Success',
  SwitchToProfileFailure = '[Shared/Profile] Switch To Action Failure',

  UpdateProfile = '[Auth] Update Profile Action ',
  UpdateProfileAvatar = '[Auth] Update Profile Avatar Action ',
  UpdateProfileSuccess = '[Auth] Update Profile Action Success',
  UpdateProfileFailure = '[Auth] Update Profile Action Failure',

  UpdateProfileKlub = '[Auth] Update Profile Klub Action ',
  UpdateProfileKlubSuccess = '[Auth] Update Profile Klub Action Success',
  UpdateProfileKlubFailure = '[Auth] Update Profile Klub Action Failure',

  GetKlubrDetail = '[Shared/Klubr] Get Klubr Details Action ',
  GetKlubrDetailSuccess = '[Shared/Klubr] Get Klubr Details Action Success',
  GetKlubrDetailFailure = '[Shared/Klubr] Get Klubr Details Action Failure',

  FilterKlubs = '[Shared/Klubs] Get Filtred Klubs Action',
  EmptyFilterKlubs = '[Shared/Klubs] Empty Filtred Klubs Action',
  FilterKlubsSuccess = '[Shared/Klubs] Get Filtred Klubs Success Action',
  FilterKlubsFailure = '[Shared/Klubs] Get Filtred Klubs Failure Action',

  FilterMembers = '[Shared/Members] Get Filtred Members Action',
  EmptyFilterMembers = '[Shared/Members] Empty Filtred Members Action',
  FilterMembersSuccess = '[Shared/Members] Get Filtred Members Success Action',
  FilterMembersFailure = '[Shared/Members] Get Filtred Members Failure Action',

  LinkMemberToUser = '[Shared/Members] Link Member To user Action',
  LinkMemberToUserSuccess = '[Shared/Members] Link Member To user Success Action',
  LinkMemberToUserFailure = '[Shared/Members] Link Member To user Failure Action',

  AddToCache = '[Shared/Cache] Add value to cache Action',
  ClearCache = '[Shared/Cache] Clear cache Action',
  ClearCacheKey = '[Shared/Cache] Remove value from cache Action',

}

/* MISC ACTIONS */
export const SetLoading = createAction(
  SharedActionTypes.SetLoading,
  props<{ loading: boolean }>()
);
export const SetError = createAction(
  SharedActionTypes.SetError,
  props<{ error: HttpError }>()
);

/* PROFILE ACTIONS */
export const SetProfile = createAction(
  SharedActionTypes.SetProfile,
  props<{ profile: KlubrMembre }>()
);

export const SwitchToProfile = createAction(
  SharedActionTypes.SwitchToProfile,
  props<{ uuid: string }>()
);

export const SwitchToProfileSuccess = createAction(
  SharedActionTypes.SwitchToProfileSuccess,
  props<{ profile: KlubrMembre }>()
);

export const SwitchToProfileFailure = createAction(
  SharedActionTypes.SwitchToProfileFailure,
  props<{ error: HttpError }>()
);

export const updateProfile = createAction(
  SharedActionTypes.UpdateProfile,
  props<{ uuid: string; profile: Partial<KlubrMembre> }>()
);

export const updateProfileSuccess = createAction(
  SharedActionTypes.UpdateProfileSuccess,
  props<{ profile: KlubrMembre }>() // to be changed to klubr do to a reqponqe type changed
);
export const updateProfileAvatar = createAction(
  SharedActionTypes.UpdateProfileAvatar,
  props<{ profileUuid: string, avatar: Media }>()
);

export const updateProfileFailure = createAction(
  SharedActionTypes.UpdateProfileFailure,
  props<{ error: HttpError }>()
);

/* KLUBS ACTIONS */
export const GetKlubrDetail = createAction(
  SharedActionTypes.GetKlubrDetail,
  props<{ slug: string }>()
);

export const GetKlubrDetailSuccess = createAction(
  SharedActionTypes.GetKlubrDetailSuccess,
  props<{ klubrDetail: any }>() // to be changed to klubr do to a reqponqe type changed
);

export const GetKlubrDetailFailure = createAction(
  SharedActionTypes.GetKlubrDetailFailure,
  props<{ error: HttpError }>()
);


export const UpdateProfileKlub = createAction(
  SharedActionTypes.UpdateProfileKlub,
  props<{ uuid: string; klub: Partial<Klubr> }>()
);

export const UpdateProfileKlubSuccess = createAction(
  SharedActionTypes.UpdateProfileKlubSuccess,
  props<{ klub: Klubr }>() // to be changed to klubr do to a reqponqe type changed
);

export const UpdateProfileKlubFailure = createAction(
  SharedActionTypes.UpdateProfileKlubFailure,
  props<{ error: HttpError }>()
);

export const FilterKlubs = createAction(
  SharedActionTypes.FilterKlubs,
  props<{ code: string, role: KlubrMembreRole }>()
);
export const EmptyFilterKlubs = createAction(
  SharedActionTypes.EmptyFilterKlubs
);
export const FilterKlubsSuccess = createAction(
  SharedActionTypes.FilterKlubsSuccess,
  props<{ filteredKlubs: Array<Klubr> }>()
);
export const FilterKlubsFailure = createAction(
  SharedActionTypes.FilterKlubsFailure,
  props<{ error: HttpError }>()
);

/* MEMBERS ACTIONS */
export const FilterMembers = createAction(
  SharedActionTypes.FilterMembers,
  props<{ code: string }>()
);
export const EmptyFilterMembers = createAction(
  SharedActionTypes.EmptyFilterMembers
);
export const FilterMembersSuccess = createAction(
  SharedActionTypes.FilterMembersSuccess,
  props<{ filteredMembers: Array<KlubrMembre> }>()
);
export const FilterMembersFailure = createAction(
  SharedActionTypes.FilterMembersFailure,
  props<{ error: HttpError }>()
);


export const LinkMemberToUser = createAction(
  SharedActionTypes.LinkMemberToUser,
  props<{ code: string, uuidUser?: string }>()
);
export const LinkMemberToUserSuccess = createAction(
  SharedActionTypes.LinkMemberToUserSuccess,
  props<{ linkedUser: UserLinkedTo }>()
);
export const LinkMemberToUserFailure = createAction(
  SharedActionTypes.LinkMemberToUserFailure,
  props<{ error: HttpError }>()
);

/* CACHE ACTIONS */
export const AddToCache = createAction(
  SharedActionTypes.AddToCache,
  props<{ key: string, cacheContent: CacheContent }>()
);
export const ClearCacheKey = createAction(
  SharedActionTypes.ClearCacheKey,
  props<{ key: string }>()
);
export const ClearCache = createAction(
  SharedActionTypes.ClearCache
);


