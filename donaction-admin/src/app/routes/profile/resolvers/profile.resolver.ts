import { ResolveFn, Router } from '@angular/router';
import { KlubrMembre } from "@shared/utils/models/user-details";
import { Observable } from "rxjs";
import { inject } from "@angular/core";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { take, tap } from "rxjs/operators";

export const profileResolver: ResolveFn<null | KlubrMembre> = (route, state): Observable<null | KlubrMembre> => {
  const router = inject(Router);
  return inject(SharedFacade).profile$.pipe(
    take(1),
    tap((profile) => {
      if (!profile) {
        router.navigate(['/']).then();
      }
      return profile;
    })
  )
};
