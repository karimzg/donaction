import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SHARED_FEATURE_KEY, State } from './shared.reducer';

export const selectSharedState = createFeatureSelector<State>(SHARED_FEATURE_KEY);

export const selectKlubrDetails = createSelector(
  selectSharedState,
  (state: State) => state.klubrDetail
);

export const selectProfile = createSelector(
  selectSharedState,
  (state: State) => state.profile
);

export const selectProfileKlub = createSelector(
  selectSharedState,
  (state: State) => state.profile?.klubr
);

export const selectProfileKlubInfosCompletion = createSelector(
  selectSharedState,
  (state: State) => state.profile?.klubr?.klubr_info?.requiredFieldsCompletion || 0
);
export const selectProfileKlubDocsCompletion = createSelector(
  selectSharedState,
  (state: State) => state.profile?.klubr?.klubr_info?.requiredDocsValidatedCompletion || 0
);
export const selectProfileKlubDocsPendingCompletion = createSelector(
  selectSharedState,
  (state: State) => state.profile?.klubr?.klubr_info?.requiredDocsWaitingValidationCompletion || 0
);
export const selectProfileKlubGlobaleCompletion = createSelector(
  selectSharedState,
  (state: State) => ((state.profile?.klubr?.klubr_info?.requiredDocsValidatedCompletion || 0)
    + (state.profile?.klubr?.klubr_info?.requiredFieldsCompletion || 0)) / 2
);

export const selectLoading = createSelector(
  selectSharedState,
  (state: State) => state.loading
);

export const selectError = createSelector(
  selectSharedState,
  (state: State) => state.error
);

export const selectIsLoaded = createSelector(
  selectSharedState,
  (state: State) => state.isLoaded
);

export const selectFilteredMembers = createSelector(
  selectSharedState,
  (state: State) => state.filteredMembers
);
export const selectFilteredKlubs = createSelector(
  selectSharedState,
  (state: State) => state.filteredKlubs
);
export const linkedUser = createSelector(
  selectSharedState,
  (state: State) => state.linkedUser
);
export const filteredMembersIsLoaded = createSelector(
  selectSharedState,
  (state: State) => state.filteredMemberIsLoaded
);
export const filteredKlubsIsLoaded = createSelector(
  selectSharedState,
  (state: State) => state.filteredKlubIsLoaded
);
export const getFromCache = (key: string) => createSelector(
  selectSharedState,
  (state: State) => state.cache.get(key)
);
