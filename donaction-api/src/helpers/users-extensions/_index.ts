import { Core } from '@strapi/strapi';
import { handlerSwitcher } from './utils';
import { register } from './auth/register';
import { exists } from './user/exists';
import { me } from './user/me';
import { findWithStats } from './user/findWithStats';
import { forgotPassword } from './auth/forgotPassword';
import { resetPassword } from './auth/resetPassword';

export default async function UsersPermissionsInitializer(
    plugin: Core.Plugin,
): Promise<void> {
    //
    const routes: Core.Route[] = plugin.routes['content-api']?.routes || [];
    const authControllers = plugin.controllers['auth'];
    const userControllers = plugin.controllers['user'];
    //

    //
    handlerSwitcher(routes, '/auth/local/register', 'auth.register_v5');
    authControllers['register_v5'] = register.bind(
        null,
        authControllers['register'],
    );
    //

    //
    handlerSwitcher(routes, '/auth/forgot-password', 'auth.forgot_password_v5');
    authControllers['forgot_password_v5'] = forgotPassword.bind(
        null,
        authControllers['forgotPassword'],
    );
    //

    //
    handlerSwitcher(routes, '/auth/reset-password', 'auth.reset_password_v5');
    authControllers['reset_password_v5'] = resetPassword.bind(
        null,
        authControllers['resetPassword'],
    );
    //

    //
    handlerSwitcher(routes, '/users/exists/:email', 'user.exists', 'GET');
    userControllers['exists'] = exists;
    //

    //
    handlerSwitcher(routes, '/users/me', 'user.me_v5');
    userControllers['me_v5'] = me.bind(null, userControllers['me']);
    //

    //
    handlerSwitcher(routes, '/users/stats', 'user.findWithStats', 'GET');
    userControllers['findWithStats'] = findWithStats;
    //
}
