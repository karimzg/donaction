import { Core } from '@strapi/strapi';

export function handlerSwitcher(
    routes: Core.Route[],
    path: string,
    handler: string,
    method:
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'PATCH'
        | 'DELETE'
        | 'ALL'
        | 'OPTIONS'
        | 'HEAD' = 'GET',
) {
    const selectedRoute = routes.find((_: Core.Route) => _.path === path);
    if (selectedRoute) {
        selectedRoute.handler = `plugin::users-permissions.${handler}`;
    } else {
        routes.push({
            handler,
            path,
            method,
            info: {},
        });
    }
}
