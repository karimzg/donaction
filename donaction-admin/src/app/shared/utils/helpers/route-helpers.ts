import { ActivatedRouteSnapshot } from "@angular/router";

export const getResolvedUrl = (route: ActivatedRouteSnapshot): string => {
  return route.pathFromRoot
    .map(v => v.url.map(segment => segment.toString()).join('/'))
    .join('/');
}

export const getConfiguredUrl = (route: ActivatedRouteSnapshot): string => {
  return '/' + route.pathFromRoot
    .filter(v => v.routeConfig)
    .map(v => v.routeConfig!.path)
    .join('/');
}
