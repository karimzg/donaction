import NextAuth, { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { login, me, update } from '@/core/services/auth';
import { cookies } from 'next/headers';
// import HttpService from '@/core/services';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            // TODO: fix || ''
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                identifier: {},
                password: {},
            },
            async authorize(credentials, req) {
                if (credentials == null) return null;
                try {
                    const {user, jwt} = await login(credentials);
                    return {...user, jwt};
                } catch (error) {
                    console.error('Login failed:', error);
                    return null;
                }
            },
        }),
    ],
    session: {strategy: 'jwt', maxAge: 30 * 24 * 60 * 60},
    callbacks: {
        async session({session, token, user}): Promise<Session> {
            if (token.id && token.jwt) {
                try {
                    // HttpService.resetToken(token.jwt as string);
                    await update(
                        token.id as string,
                        {
                            lastLogin: Date.now(),
                        },
                        cookies().toString(),
                    );
                    const data = await me(cookies().toString());
                    return {
                        ...data,
                        prenom: data?.prenom || session.user?.name || '',
                        image: session?.user?.image,
                        logout: false,
                        expires: session.expires,
                        token: (token.jwt as string) || '',
                    } as Session;
                } catch (e) {
                    console.log('Session error', e);
                    return {
                        logout: true,
                    } as Session;
                }
            } else {
            }
            return session;
        },
        async jwt({token, user, account, session}) {
            // @ts-expect-error jwt is not a property
            if (user?.jwt && user?.id) {
                // @ts-expect-error jwt is not a property
                token.jwt = user.jwt;
                token.id = user.id;
            } else if (!!user && !!account) {
                try {
                    const response: any = await fetch(
                        `${process.env.NEXT_PUBLIC_SERVER_COMPONENTS_DEV_API_URL}/api/auth/${account.provider}/callback?access_token=${account?.access_token}`,
                    );
                    const data = await response.json();
                    token.jwt = data?.jwt;
                    token.id = data?.user?.id;
                } catch (error) {
                    console.error('Fetch failed:', error);
                }
            }
            return Promise.resolve(token);
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
