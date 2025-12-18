---
name: "ngrx-feature-state"
description: "Generate complete NgRx feature state with actions, reducer, effects, selectors, and facade pattern"
triggers: ["create NgRx state", "add NgRx feature", "state management", "create facade", "NgRx setup", "redux store", "actions reducer", "effects selectors", "feature state"]
tags: ["angular", "ngrx", "state-management", "typescript"]
priority: high
scope: module
output: files
---

# NgRx Feature State

## Instructions

- Identify feature name and state shape from user request
- Create directory structure: `data-access/+state/`
- Generate actions with typed payloads (success/failure patterns)
- Create reducer with initial state and action handlers
- Generate effects for async operations (API calls)
- Create selectors for state slicing
- Generate facade service exposing state as signals and action dispatchers
- Use `toSignal()` for Observable to signal conversion

## Example

**Input:** "Create NgRx state for user authentication with login/logout"

**Output:** Complete NgRx feature with all files

```typescript
// auth.actions.ts
import { createAction, props } from '@ngrx/store';
import { User } from '@shared/utils/models/user-details';

export const login = createAction(
  '[Auth] Login',
  props<{ credentials: { email: string; password: string } }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');
```

```typescript
// auth.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { User } from '@shared/utils/models/user-details';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(AuthActions.logout, () => initialState)
);
```

```typescript
// auth.effects.ts
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../repositories/auth.service';
import * as AuthActions from './auth.actions';

export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map(response => AuthActions.loginSuccess({
            user: response.user,
            token: response.jwt
          })),
          catchError(error => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );
}
```

```typescript
// auth.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => !!state.token
);

export const selectLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);
```

```typescript
// auth.facade.ts
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import * as AuthActions from './auth.actions';
import * as AuthSelectors from './auth.selectors';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private store = inject(Store);

  // Expose state as observables
  user$ = this.store.select(AuthSelectors.selectUser);
  token$ = this.store.select(AuthSelectors.selectToken);
  isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
  loading$ = this.store.select(AuthSelectors.selectLoading);

  // Expose state as signals
  user = toSignal(this.user$, { initialValue: null });
  token = toSignal(this.token$, { initialValue: null });
  isAuthenticated = toSignal(this.isAuthenticated$, { initialValue: false });
  loading = toSignal(this.loading$, { initialValue: false });

  // Action dispatchers
  login(credentials: { email: string; password: string }) {
    this.store.dispatch(AuthActions.login({ credentials }));
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
```
