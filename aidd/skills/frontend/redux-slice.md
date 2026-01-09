---
name: skill:creating-redux-slices
description: Creates Redux Toolkit slices for global client-side state. Use when adding global state management in donaction-frontend.
model: claude-sonnet-4-5
---

# Skill: Redux Toolkit Slices

## When to use
When managing global client-side state that needs to persist across navigation, like:
- User session/auth state
- Toast notifications
- UI preferences
- Shopping cart (donations in progress)

## Key Concepts
- Redux only works in Client Components
- Use Redux Toolkit for simplified syntax
- Keep state minimal - prefer Server Components for data
- Typed hooks for type safety

## Recommended Patterns

### Slice Definition
```typescript
// core/store/modules/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

const initialState: AuthState = {
  session: null,
  status: 'loading',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session>) => {
      state.session = action.payload;
      state.status = 'authenticated';
    },
    clearSession: (state) => {
      state.session = null;
      state.status = 'unauthenticated';
    },
    setStatus: (state, action: PayloadAction<AuthState['status']>) => {
      state.status = action.payload;
    },
  },
});

export const { setSession, clearSession, setStatus } = authSlice.actions;
export default authSlice.reducer;
```
**Why**: Slices combine reducer + actions in one file, less boilerplate.

### Toast/Notification Slice
```typescript
// core/store/modules/rootSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail?: string;
  life?: number;
}

interface RootState {
  toasts: Toast[];
}

const initialState: RootState = {
  toasts: [],
};

export const rootSlice = createSlice({
  name: 'root',
  initialState,
  reducers: {
    pushToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      state.toasts.push({
        ...action.payload,
        id: Date.now().toString(),
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { pushToast, removeToast, clearToasts } = rootSlice.actions;
export default rootSlice.reducer;
```
**Why**: Centralized toast management accessible from any client component.

### Store Configuration
```typescript
// core/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './modules/authSlice';
import rootReducer from './modules/rootSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      root: rootReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
```

### Typed Hooks
```typescript
// core/store/hooks.ts
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, RootState, AppStore } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
```
**Why**: Type-safe hooks prevent runtime errors.

### Provider Setup
```tsx
// app/Providers.tsx
'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/core/store';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <SessionProvider>
      <Provider store={storeRef.current}>
        {children}
      </Provider>
    </SessionProvider>
  );
}

// app/layout.tsx
import { Providers } from './Providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```
**Why**: Store must be created once per request in SSR context.

### Usage in Components
```tsx
// layouts/components/toaster/index.tsx
'use client';

import { useAppSelector, useAppDispatch } from '@/core/store/hooks';
import { removeToast } from '@/core/store/modules/rootSlice';
import { Toast } from 'primereact/toast';
import { useRef, useEffect } from 'react';

export function Toaster() {
  const toasts = useAppSelector((state) => state.root.toasts);
  const dispatch = useAppDispatch();
  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    toasts.forEach((toast) => {
      toastRef.current?.show({
        severity: toast.severity,
        summary: toast.summary,
        detail: toast.detail,
        life: toast.life || 3000,
      });
      // Remove after showing
      setTimeout(() => dispatch(removeToast(toast.id)), toast.life || 3000);
    });
  }, [toasts, dispatch]);

  return <Toast ref={toastRef} />;
}
```

### Dispatching from Anywhere
```tsx
'use client';

import { useAppDispatch } from '@/core/store/hooks';
import { pushToast } from '@/core/store/modules/rootSlice';
import { setSession } from '@/core/store/modules/authSlice';

export function LoginForm() {
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    try {
      const session = await login(email, password);
      dispatch(setSession(session));
      dispatch(pushToast({
        severity: 'success',
        summary: 'Connecté',
        detail: 'Bienvenue !',
      }));
    } catch (error) {
      dispatch(pushToast({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Identifiants incorrects',
      }));
    }
  };

  return <form onSubmit={handleLogin}>...</form>;
}
```

## Detailed Anti-patterns

### ❌ Using Redux for Server Data
```typescript
// Wrong - Fetch in Server Component instead
const projectsSlice = createSlice({
  name: 'projects',
  initialState: { items: [], loading: false },
  reducers: {
    setProjects: (state, action) => {
      state.items = action.payload;
    },
  },
});

// Then in component
useEffect(() => {
  fetch('/api/projects').then(data => dispatch(setProjects(data)));
}, []);
```
**Problem**: Duplicates Server Component capability, causes loading states.
**Solution**: Fetch in Server Component, pass data as props.

### ❌ Redux in Server Components
```tsx
// Wrong - Can't use hooks in Server Components
export default async function Page() {
  const session = useAppSelector(state => state.auth.session); // Error!
}
```
**Problem**: Hooks only work in Client Components.
**Solution**: Use in Client Components only, or access session differently on server.

## Checklist
- [ ] Slice has typed initial state
- [ ] Actions exported from slice
- [ ] Using typed hooks (useAppDispatch, useAppSelector)
- [ ] Store created once with makeStore
- [ ] Provider wraps app in root layout
- [ ] Only for truly global client state
