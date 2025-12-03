import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AUTH_FEATURE_KEY, State } from './auth.reducer';

export const selectLoginState = createFeatureSelector<State>(AUTH_FEATURE_KEY);

export const selectLoading = createSelector(
  selectLoginState,
  (state: State) => state.loading
);

export const selectError = createSelector(
  selectLoginState,
  (state: State) => state.authError
);

export const selectAuthMode = createSelector(
  selectLoginState,
  (state: State) => state.authMode,
);

export const selectToken = createSelector(
  selectLoginState,
  (state: State) => state.token,
);

export const selectAuthenticated = createSelector(
  selectLoginState,
  (state: State) => state.isAuthenticated
);

export const selectIsLoaded = createSelector(
  selectLoginState,
  (state: State) => state.loaded
);

export const selectIsPassWordUpdateLoaded = createSelector(
  selectLoginState,
  (state: State) => state.changePassIsLoaded
);

export const selectMe = createSelector(
  selectLoginState,
  (state: State) => state.me,
);

export const selectMeRole  = createSelector(
  selectLoginState,
  (state: State) => state.me?.role,
);
