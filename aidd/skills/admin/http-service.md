---
name: "angular-http-service"
description: "Create Angular HTTP service with proper error handling, interceptors integration, and Observable patterns"
triggers: ["create service", "HTTP service", "API service", "create repository", "data service", "fetch data", "call api", "HTTP client"]
tags: ["angular", "http", "service", "rxjs", "typescript"]
priority: high
scope: file
output: code
---

# Angular HTTP Service with Error Handling

## Instructions

- Identify entity name and API endpoints from user request
- Create service in appropriate directory (`data-access/repositories/` or `shared/services/`)
- Use `inject(HttpClient)` for dependency injection
- Return Observable<T> for all methods
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Add error handling with catchError operator
- Use ToastService for user notifications
- Import types from @donaction-admin/src/app/shared/utils/models/
- Use environment config for API base URL

## Example

**Input:** "Create a service to manage user profiles with CRUD operations"

**Output:** HTTP service with error handling

```typescript
// user.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ToastService } from '@shared/services/misc/toast.service';
import { User } from '@shared/utils/models/user-details';

interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/users`;

  /**
   * Get all users with optional filters
   */
  getUsers(params?: { page?: number; pageSize?: number }): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params }).pipe(
      map(response => response.data),
      catchError(error => {
        this.toastService.showErrorToast('Failed to load users');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user by ID
   */
  getUser(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.toastService.showErrorToast('Failed to load user');
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new user
   */
  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, userData).pipe(
      map(response => response.data),
      catchError(error => {
        this.toastService.showErrorToast('Failed to create user');
        return throwError(() => error);
      })
    );
  }

  /**
   * Update existing user
   */
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, userData).pipe(
      map(response => response.data),
      catchError(error => {
        this.toastService.showErrorToast('Failed to update user');
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        this.toastService.showErrorToast('Failed to delete user');
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload user avatar
   */
  uploadAvatar(userId: string, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<ApiResponse<User>>(
      `${this.apiUrl}/${userId}/avatar`,
      formData
    ).pipe(
      map(response => response.data),
      catchError(error => {
        this.toastService.showErrorToast('Failed to upload avatar');
        return throwError(() => error);
      })
    );
  }
}
```

**Usage in Component:**

```typescript
export class UserListComponent {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  users = signal<User[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getUsers({ page: 1, pageSize: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }
}
```
