import { createAction, props } from '@ngrx/store';
import { AuthMode, User } from '../../model/user';
import { HttpError } from '@shared/utils/models/codes-errors';
import { KlubrMembre, UserDetail } from '@shared/utils/models/user-details';
import { RegisterRequest } from '../../model/registerRequest';
import { Klubr } from "@shared/utils/models/klubr";

enum AuthActionTypes {
  SetAuthMode = '[Auth] Set Auth Mode',
  SetToken = '[Auth] Set Token',

  Login = '[Auth] Login Action ',
  LoginSuccess = '[Auth] Login Action Success',
  LoginFailure = '[Auth] Login Action Failure',

  Logout = '[Auth] Logout Action ',
  LogoutSuccess = '[Auth] Logout Action Success',

  SetIsAuthenticated = '[Auth] Set Is Authenticated Action',
  SetIsAuthenticatedSuccess = '[Auth] Set Is Authenticated Action Success',

  GetMe = '[Auth/Me] Get Me Action ',
  GetMeSuccess = '[Auth/Me] Get Me Action Success',
  GetMeFailure = '[Auth/Me] Get Me Action Failure',

  SetMeLastProfileUsed = '[Auth/Me] Set Me Last Profile Used',
  UpdateProfileInList = '[Auth/Me] Update Profile In User List',

  UpdateKlubInList = '[Auth/Me] Update Profile Klub In User List',

  UpdateMeInfo = '[Auth] Update User Info Action ',
  UpdateMeInfoSuccess = '[Auth] Update User Info Action Success',
  UpdateMeInfoFailure = '[Auth] Update User Info Action Failure',

  ChangeMePassword = '[Auth] Update Me Password Action ',
  ChangeMePasswordSuccess = '[Auth] Update Me Password Action Success',
  ChangeMePasswordFailure = '[Auth] Update Me Info Action Failure',

  Register = '[Auth] Register Action ',
  RegisterSuccess = '[Auth] Register Action Success',
  RegisterFailure = '[Auth] Register Action Failure',

  GoogleRegister = '[Auth/Register] Google Register Action ',
  GoogleRegisterSuccess = '[Auth/Register] Google Register Action Success',
  GoogleRegisterFailure = '[Auth/Register] Google Register Action Failure',
}

export const setAuthMode = createAction(
  AuthActionTypes.SetAuthMode,
  props<{ authMode: AuthMode }>()
);

export const setToken = createAction(
  AuthActionTypes.SetToken,
  props<{ token: string | null }>()
);

export const login = createAction(
  AuthActionTypes.Login,
  props<{ identifier: string; password: string }>()
);

export const loginSuccess = createAction(
  AuthActionTypes.LoginSuccess,
  props<{ user: User }>()
);

export const loginFailure = createAction(
  AuthActionTypes.LoginFailure,
  props<{ error: HttpError }>()
);

export const logout = createAction(AuthActionTypes.Logout);

export const logoutSuccess = createAction(AuthActionTypes.LogoutSuccess);

export const isAuthenticated = createAction(
  AuthActionTypes.SetIsAuthenticated,
  props<{ isAuthenticated: boolean }>()
);

export const isAuthenticatedSuccess = createAction(
  AuthActionTypes.SetIsAuthenticatedSuccess,
  props<{ isAuthenticated: boolean }>()
);


export const GetMe = createAction(
  AuthActionTypes.GetMe
);
export const GetMeSuccess = createAction(
  AuthActionTypes.GetMeSuccess,
  props<{ me: UserDetail }>()
);
export const GetMeFailure = createAction(
  AuthActionTypes.GetMeFailure,
  props<{ error: HttpError }>()
);

export const SetMeLastProfileUsed = createAction(
  AuthActionTypes.SetMeLastProfileUsed,
  props<{ profileUuid: string }>()
);

export const UpdateProfileInList = createAction(
  AuthActionTypes.UpdateProfileInList,
  props<{ profile: Partial<KlubrMembre> }>()
);

export const UpdateKlubInList = createAction(
  AuthActionTypes.UpdateKlubInList,
  props<{ klub: Partial<Klubr> }>()
);

export const updateMeInfo = createAction(
  AuthActionTypes.UpdateMeInfo,
  props<{ id: string | number; userDetail: UserDetail }>()
);

export const updateMeInfoSuccess = createAction(
  AuthActionTypes.UpdateMeInfoSuccess,
  props<{ userInfo: UserDetail }>() // to be changed to klubr do to a reqponqe type changed
);

export const updateMeInfoFailure = createAction(
  AuthActionTypes.UpdateMeInfoFailure,
  props<{ error: HttpError }>()
);

export const changeMePassword = createAction(
  AuthActionTypes.ChangeMePassword,
  props<{ currentPassword: string; password: string; passwordConfirmation: string }>()
);

export const changeMePasswordSuccess = createAction(
  AuthActionTypes.ChangeMePasswordSuccess,
  props<{ user: User }>()
);

export const changeMePasswordFailure = createAction(
  AuthActionTypes.UpdateMeInfoFailure,
  props<{ error: HttpError }>()
);

export const register = createAction(
  AuthActionTypes.Register,
  props<{ registerRequest: RegisterRequest }>()
);

export const registerSuccess = createAction(
  AuthActionTypes.RegisterSuccess,
  props<{ user: User }>()
);

export const registerFailure = createAction(
  AuthActionTypes.RegisterFailure,
  props<{ error: HttpError }>()
);

export const googleRegister = createAction(
  AuthActionTypes.GoogleRegister,
  props<{ accountProvider: string, accessToken: string }>()
);

export const googleRegisterSuccess = createAction(
  AuthActionTypes.GoogleRegisterSuccess,
  props<{ user: User }>()
);

export const googleRegisterFailure = createAction(
  AuthActionTypes.GoogleRegisterFailure,
  props<{ error: HttpError }>()
);
