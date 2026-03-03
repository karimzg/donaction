---
name: skill:creating-rxjs-pipelines
description: Creates RxJS observable streams with operators, error handling, and takeUntilDestroyed cleanup. Use when building async data flows in donaction-admin.
model: claude-sonnet-4-5
---

# RxJS Data Stream Pipeline

## Instructions

- Identify data source and transformation requirements from user request
- Use appropriate operators: `map`, `switchMap`, `filter`, `debounceTime`, `distinctUntilChanged`
- Add error handling with `catchError` operator
- Use `takeUntilDestroyed()` for automatic subscription cleanup
- Combine multiple streams with `combineLatest`, `merge`, or `forkJoin`
- Use `tap` for side effects (logging, debugging)
- Return typed Observable<T>

## Example

**Input:** "Create a search observable that debounces user input and fetches results from API"

**Output:** RxJS pipeline with operators

```typescript
// search.component.ts
import { Component, signal, DestroyRef, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { SearchService } from '@shared/services/search.service';
import { SearchResult } from '@shared/utils/models/search';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html'
})
export class SearchComponent {
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  results = signal<SearchResult[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.setupSearchStream();
  }

  private setupSearchStream() {
    this.searchControl.valueChanges.pipe(
      // Only search when term is 3+ characters
      filter(term => (term?.length ?? 0) >= 3),
      // Wait 300ms after user stops typing
      debounceTime(300),
      // Only search if term changed
      distinctUntilChanged(),
      // Show loading state
      tap(() => this.loading.set(true)),
      // Cancel previous search and start new one
      switchMap(term =>
        this.searchService.search(term!).pipe(
          // Handle errors gracefully
          catchError(error => {
            console.error('Search failed:', error);
            return of([]);
          })
        )
      ),
      // Log results for debugging
      tap(results => console.log('Search results:', results)),
      // Automatic cleanup when component destroys
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(results => {
      this.results.set(results);
      this.loading.set(false);
    });
  }
}
```

**Combining Multiple Streams:**

```typescript
// user-profile.component.ts
import { Component, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserService } from '@shared/services/user.service';
import { ProjectService } from '@shared/services/project.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent {
  private userService = inject(UserService);
  private projectService = inject(ProjectService);
  private destroyRef = inject(DestroyRef);

  profile = signal<UserProfile | null>(null);

  ngOnInit() {
    this.loadUserProfile();
  }

  private loadUserProfile() {
    const userId = 'user-123';

    // Fetch user and their projects in parallel
    combineLatest([
      this.userService.getUser(userId),
      this.projectService.getUserProjects(userId)
    ]).pipe(
      map(([user, projects]) => ({
        user,
        projects,
        projectCount: projects.length,
        activeProjects: projects.filter(p => p.status === 'active')
      })),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(profile => {
      this.profile.set(profile);
    });
  }
}
```

**Sequential API Calls:**

```typescript
// order-details.component.ts
import { Component, signal, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { OrderService } from '@shared/services/order.service';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html'
})
export class OrderDetailsComponent {
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  orderId = input.required<string>();
  orderWithUser = signal<OrderDetails | null>(null);

  ngOnInit() {
    // Fetch order, then fetch its user based on order.userId
    this.orderService.getOrder(this.orderId()).pipe(
      switchMap(order =>
        this.userService.getUser(order.userId).pipe(
          map(user => ({ order, user }))
        )
      ),
      catchError(error => {
        console.error('Failed to load order details:', error);
        return throwError(() => error);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(details => {
      this.orderWithUser.set(details);
    });
  }
}
```
