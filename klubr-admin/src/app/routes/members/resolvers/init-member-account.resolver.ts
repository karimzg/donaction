import { ResolveFn } from '@angular/router';
import { of } from "rxjs";

export const initMemberAccountResolver: ResolveFn<boolean | undefined> = (route, state) => {
  const statusInit = (route.queryParamMap.get('filterMemberAccount') || undefined);
  return statusInit
    ? (statusInit === 'true' ? of(true) : of(false))
    : of(undefined);
};
