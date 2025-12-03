import { createReducer, on } from "@ngrx/store";
import { HttpError } from "@shared/utils/models/codes-errors";
import * as SharedActions from './shared.actions';
import { Klubr, UserLinkedTo } from "@shared/utils/models/klubr";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { CacheContent } from "@shared/utils/models/cache";

export const SHARED_FEATURE_KEY = 'shared'

export interface State {
  klubrDetail: Klubr | null;
  profile: KlubrMembre | null;
  error: HttpError | null;
  errorMembersFiltered: HttpError | null;
  errorKlubssFiltered: HttpError | null;
  loading: boolean;
  isLoaded: boolean
  filteredMembers?: Array<KlubrMembre>;
  filteredMemberIsLoaded: boolean;
  filteredKlubs?: Array<Klubr>;
  filteredKlubIsLoaded: boolean;
  linkedUser: UserLinkedTo | null;
  cache: Map<string, CacheContent>;
}

export const initialState: State = {
  klubrDetail: null,
  profile: null,
  error: null,
  loading: false,
  isLoaded: false,
  errorMembersFiltered: null,
  errorKlubssFiltered: null,
  filteredMembers: [],
  filteredMemberIsLoaded: false,
  filteredKlubs: [],
  filteredKlubIsLoaded: false,
  linkedUser: null,
  cache: new Map<string, CacheContent>(),
};

export const sharedReducer = createReducer(
  initialState,
  on(SharedActions.SetLoading, (state, {loading}) => ({...state, loading})),
  on(SharedActions.SetError, (state, {error}) => ({...state, error})),

  on(SharedActions.GetKlubrDetail, state => ({...state, loading: true, error: null})),
  on(SharedActions.GetKlubrDetailSuccess, (state, {klubrDetail}) => ({...state, loading: false, klubrDetail})),
  on(SharedActions.GetKlubrDetailFailure, (state, {error}) => ({...state, user: null, loading: false, error})),
  on(SharedActions.SetProfile, (state, {profile}) => ({...state, profile})),
  on(SharedActions.SwitchToProfile, state => ({...state, loading: true, error: null})),
  on(SharedActions.SwitchToProfileSuccess, (state, {profile}) => ({...state, loading: false, profile})),
  on(SharedActions.SwitchToProfileFailure, (state, {error}) => ({...state, user: null, loading: false, error})),

  on(SharedActions.updateProfile, state => ({...state, loading: true, loaded: false, error: null})),
  on(SharedActions.updateProfileSuccess, (state, {profile}) => ({
    ...state, loading: false, loaded: true,
    profile: state.profile?.uuid === profile.uuid ? {...state.profile, ...profile} : state.profile
  })),
  on(SharedActions.updateProfileAvatar, (state, {profileUuid, avatar}) => {
    if (!state.profile) return state;
    if (state.profile?.uuid !== profileUuid) return state;
    const newProfile: KlubrMembre = {...state.profile, avatar: {...state.profile?.avatar, ...avatar}};
    return {...state, profile: newProfile};
  }),
  on(SharedActions.updateProfileFailure, (state, {error}) => ({...state, loading: false, loaded: false, error})),

  on(SharedActions.UpdateProfileKlub, state => ({...state, loading: true, loaded: false, error: null})),
  on(SharedActions.UpdateProfileKlubSuccess, (state, {klub}) => {
    if (!state.profile) return state;
    if (state.profile?.klubr?.uuid !== klub.uuid) return state;
    return {
      ...state,
      loading: false,
      loaded: true,
      profile: {...state.profile, klubr: {...state.profile?.klubr, ...klub}}
    };
  }),
  on(SharedActions.UpdateProfileKlubFailure, (state, {error}) => ({...state, loading: false, loaded: false, error})),

  on(SharedActions.FilterKlubs, state => ({
    ...state,
    loading: true,
    filteredKlubIsLoaded: false,
    errorKlubsFiltered: null
  })),
  on(SharedActions.EmptyFilterKlubs, state => ({
    ...state,
    loading: false,
    filteredKlubIsLoaded: true,
    errorKlubsFiltered: null,
    filteredKlubs: undefined
  })),
  on(SharedActions.FilterKlubsSuccess, (state, {filteredKlubs}) => ({
    ...state,
    filteredKlubIsLoaded: true,
    loading: false,
    filteredKlubs
  })),
  on(SharedActions.FilterKlubsFailure, (state, {error}) => ({
    ...state,
    loading: false,
    filteredKlubIsLoaded: false,
    errorKlubsFiltered: error
  })),

  on(SharedActions.FilterMembers, state => ({
    ...state,
    loading: true,
    filteredMemberIsLoaded: false,
    errorMembersFiltered: null
  })),
  on(SharedActions.EmptyFilterMembers, state => ({
    ...state,
    loading: false,
    filteredMemberIsLoaded: true,
    errorMembersFiltered: null,
    filteredMembers: undefined
  })),
  on(SharedActions.FilterMembersSuccess, (state, {filteredMembers}) => ({
    ...state,
    filteredMemberIsLoaded: true,
    loading: false,
    filteredMembers
  })),
  on(SharedActions.FilterMembersFailure, (state, {error}) => ({
    ...state,
    loading: false,
    filteredMemberIsLoaded: false,
    errorMembersFiltered: error
  })),

  on(SharedActions.LinkMemberToUser, state => ({...state, loading: true, error: null})),
  on(SharedActions.LinkMemberToUserSuccess, (state, {linkedUser}) => ({...state, loading: false, linkedUser})),
  on(SharedActions.LinkMemberToUserFailure, (state, {error}) => ({...state, loading: false, error: error})),

  on(SharedActions.AddToCache, (state, {key, cacheContent}) => {
    const cache = new Map(state.cache);
    cache.set(key, cacheContent);
    return {...state, cache};
  }),
  on(SharedActions.ClearCacheKey, (state, {key}) => {
    const cache = new Map(state.cache);
    cache.delete(key);
    return {...state, cache};
  }),
  on(SharedActions.ClearCache, state => ({...state, cache: new Map()})),
);
