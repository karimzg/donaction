import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from "rxjs";
import { map, take, tap } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { AddToCache, ClearCache, ClearCacheKey } from "@shared/data-access/+state/shared.actions";
import { getFromCache } from "@shared/data-access/+state/shared.selectors";

@Injectable({
  providedIn: 'root'
})
export class CachingService {
  private store = inject(Store);

  constructor() {
  }

  // Get data from cache
  get<T>(key: string): Observable<T | undefined> {
    return this.store.select(getFromCache(key)).pipe(
      take(1),
      map(data => {
        if (data) {
          const now = new Date().getTime();
          if (now > data.expiry) {
            this.store.dispatch(ClearCacheKey({key}));
            return undefined;
          } else {
            return data.value;
          }
        } else {
          return undefined;
        }
      })
    );
  }

  // Set data to cache
  set(key: string, value: any, ttl: number = 300000): Observable<any> {
    const expiry = new Date().getTime() + ttl;
    this.store.dispatch(AddToCache({key, cacheContent: {expiry, value}}));
    return of(value);
  }

  // Cache and return the Observable
  cacheObservable<T>(key: string, fallback: Observable<T>, ttl?: number): Observable<T> {
    return this.get<T>(key).pipe(
      switchMap(data => {
        if (data) {
          return of(data);
        } else {
          return fallback.pipe(
            tap(value => {
              this.set(key, value, ttl);
            })
          );
        }
      })
    )
  }

  // Clear a specific cache key
  clearCacheKey(key: string): void {
    this.store.dispatch(ClearCacheKey({key}));
  }

  // Clear the entire cache
  clearCache(): void {
    this.store.dispatch(ClearCache());
  }
}
