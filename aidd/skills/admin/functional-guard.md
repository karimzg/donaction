---
name: skill:creating-angular-guards
description: Creates Angular functional route guards with CanActivateFn for authentication and authorization. Use when protecting routes in donaction-admin.
model: claude-haiku-4-5
---

# Angular Functional Guard

## Instructions

- Identify guard purpose (auth, permission, data validation) from user request
- Create functional guard with `CanActivateFn` type
- Use `inject()` to access services within guard function
- Return boolean, UrlTree, or Observable/Promise of these types
- Handle navigation redirects with Router.createUrlTree()
- Add guard to route configuration in `*.routes.ts`
- Place guards in @donaction-admin/src/app/shared/utils/guards/

## Example

**Input:** "Create an authentication guard that redirects to login if user not authenticated"

**Output:** Functional guard with auth check

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthFacade } from '@shared/data-access/+state/auth.facade';

export const authGuard: CanActivateFn = (route, state) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      // Redirect to login with return URL
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};
```

**Permission Guard Example:**

```typescript
// permission.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthFacade } from '@shared/data-access/+state/auth.facade';
import { PermissionsService } from '@shared/services/misc/permissions.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authFacade = inject(AuthFacade);
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as string;

  return authFacade.user$.pipe(
    map(user => {
      if (!user) {
        return router.createUrlTree(['/auth/login']);
      }

      if (permissionsService.hasPermission(user, requiredPermission)) {
        return true;
      }

      // Redirect to forbidden page
      return router.createUrlTree(['/forbidden']);
    })
  );
};
```

**Route Configuration:**

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '@shared/utils/guards/auth.guard';
import { permissionGuard } from '@shared/utils/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, permissionGuard],
    data: { permission: 'admin' },
    loadChildren: () => import('./routes/dashboard/dashboard.routes')
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./routes/profile/profile.component')
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./routes/auth/login/login.component')
  }
];
```

**Data Validation Guard:**

```typescript
// data-exists.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProjectService } from '@shared/services/project.service';

export const projectExistsGuard: CanActivateFn = (route) => {
  const projectService = inject(ProjectService);
  const router = inject(Router);
  const projectId = route.paramMap.get('id');

  if (!projectId) {
    return router.createUrlTree(['/projects']);
  }

  return projectService.getProject(projectId).pipe(
    map(() => true),
    catchError(() => {
      return of(router.createUrlTree(['/projects']));
    })
  );
};
```
