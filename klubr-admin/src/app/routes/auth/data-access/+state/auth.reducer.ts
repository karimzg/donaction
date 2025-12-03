import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { HttpError } from '@shared/utils/models/codes-errors';
import { UserDetail } from "@shared/utils/models/user-details";
import { AuthMode } from "../../model/user";

export const AUTH_FEATURE_KEY = 'auth'

export interface State {
  authMode: AuthMode;
  token: string | null | undefined;
  isAuthenticated: boolean | undefined;
  me: UserDetail | null | undefined;
  jwt: string | null;
  error: HttpError | null;
  authError: HttpError | null; // Use a specific type for errors
  loading: boolean;
  loaded: boolean;
  changePassIsLoaded: boolean;
}

export const initialState: State = {
  authMode: 'nextJs',
  token: undefined,
  isAuthenticated: undefined,
  me: undefined,
  jwt: null,
  error: null,
  loading: false,
  loaded: false,
  changePassIsLoaded: false,
  authError: null
};

export const reducer = createReducer(
  initialState,
  on(AuthActions.setAuthMode, (state, {authMode}) => ({...state, authMode})),
  on(AuthActions.setToken, (state, {token}) => ({...state, token})),

  on(AuthActions.login, state => ({...state, loading: true, authError: null})),
  on(AuthActions.loginSuccess, (state, {user}) => ({...state, loading: false, jwt: user.jwt, isAuthenticated: true,})),
  on(AuthActions.loginFailure, (state, {error}) => ({
    ...state,
    user: null,
    loading: false,
    authError: error,
    isAuthenticated: false
  })),
  on(AuthActions.logout, state => ({...state, loading: true, error: null,})),
  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    user: null,
    loading: false,
    me: null,
    jwt: null,
    isAuthenticated: false
  })),

  on(AuthActions.isAuthenticated, state => ({...state, error: null,})),
  on(AuthActions.isAuthenticatedSuccess, (state, {isAuthenticated}) => ({
    ...state,
    isAuthenticated,
    me: isAuthenticated ? state.me : null,
    jwt: isAuthenticated ? state.jwt : null
  })),

  on(AuthActions.GetMe, state => ({...state, loading: true, error: null})),
  on(AuthActions.GetMeSuccess, (state, {me}) => ({...state, loading: false, me})),
  on(AuthActions.GetMeFailure, (state, {error}) => ({...state, me: null, loading: false, error})),
  on(AuthActions.SetMeLastProfileUsed, (state, {profileUuid}) => {
    const returnedMe = !!state.me ? {...state.me, last_member_profile_used: profileUuid} : null;
    return {...state, me: returnedMe, loading: false}
  }),
  on(AuthActions.UpdateProfileInList, (state, {profile}) => {
    const profiles = state.me?.klubr_membres?.map(p =>
      p.uuid === profile.uuid ? {
        ...p, ...profile,
        avatar: profile.avatar ? {...p.avatar, ...profile.avatar} : p.avatar
      } : p) || [];
    const returnedMe: UserDetail | null = !!state.me ? {...state.me, klubr_membres: profiles} : null;
    return {...state, me: returnedMe, loading: false}
  }),
  on(AuthActions.UpdateKlubInList, (state, {klub}) => {
    const profiles = state.me?.klubr_membres?.map(p =>
      p.klubr.uuid === klub.uuid ? {...p, klubr: {...p.klubr, ...klub}} : p) || [];
    const returnedMe: UserDetail | null = !!state.me ? {...state.me, klubr_membres: profiles} : null;
    return {...state, me: returnedMe, loading: false}
  }),

  on(AuthActions.updateMeInfo, state => ({...state, loading: true, loaded: false, error: null})),
  on(AuthActions.updateMeInfoSuccess, (state, {userInfo}) => ({
    ...state,
    loading: false,
    loaded: true,
    me: {...state.me, ...userInfo}
  })),
  on(AuthActions.updateMeInfoFailure, (state, {error}) => ({...state, loading: false, loaded: false, error})),

  on(AuthActions.changeMePassword, state => ({...state, changePassIsLoaded: false, loading: true, error: null})),
  on(AuthActions.changeMePasswordSuccess, (state, {user}) => ({
    ...state,
    changePassIsLoaded: true,
    loading: false,
    me: {...state.me, ...user.user}
  })),
  on(AuthActions.changeMePasswordFailure, (state, {error}) => ({
    ...state,
    changePassIsLoaded: false,
    loading: false,
    error
  })),

  on(AuthActions.register, state => ({...state, loading: true, error: null})),
  on(AuthActions.registerSuccess, (state, {user}) => ({
    ...state,
    loading: false,
    jwt: user.jwt,
    isAuthenticated: true,
  })),
  on(AuthActions.registerFailure, (state, {error}) => ({
    ...state,
    user: null,
    loading: false,
    error,
    isAuthenticated: false
  })),

  on(AuthActions.googleRegister, state => ({...state, loading: true, error: null})),
  on(AuthActions.googleRegisterSuccess, (state, {user}) => ({
    ...state,
    loading: false,
    jwt: user.jwt,
    isAuthenticated: true,
  })),
  on(AuthActions.googleRegisterFailure, (state, {error}) => ({
    ...state,
    user: null,
    loading: false,
    error,
    isAuthenticated: false
  })),
);
