import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';
import { getClubByUuid } from '@/core/services/club';

const paths = {
	protected_auth: ['/profile', '/mes-dons'],
	protected_no_auth: ['/connexion', '/reset-password'],
	public: ['/*'],
	ignored: ['/_next', '/api', '/images', '/animations'],
	web_components: '/donaction-web-components',
};
export async function middleware(request: NextRequest) {
	if (
		request.nextUrl.pathname.startsWith(paths.web_components) ||
		request.nextUrl.pathname.startsWith('/api/create-payment-intent')
	) {
		return manageWC(request);
	}
	if (paths.ignored.some((_) => request.nextUrl.pathname.startsWith(_))) return NextResponse.next();
	const isProtectedAuth = paths.protected_auth.some((_) => request.nextUrl.pathname.startsWith(_));
	const isProtectedNoAuth = paths.protected_no_auth.some((_) =>
		request.nextUrl.pathname.startsWith(_),
	);
	const search = new URLSearchParams(request.nextUrl.search);
	if (request.nextUrl.pathname.startsWith('/new-club/congratulations')) {
		// try {
		// 	// TODO: 404 because DRAFT
		// 	const res = await getClubByUuid(search.get('clubUuid'));
		// 	console.log(res);
		// } catch (e) {
		// 	console.log(e);
		// }
	}
	if (isProtectedAuth || isProtectedNoAuth) {
		const token = await getToken({ req: request });
		const isConnected = token && token?.jwt;
		if (isProtectedAuth && !isConnected) {
			search.delete('redirect');
			let message: string = '';
			switch (true) {
				case request.nextUrl.pathname.startsWith('/profile'):
					message = 'Connectez vous ou créez votre compte pour accéder à votre profil.';
					break;
				// case request.nextUrl.pathname === '/new-club':
				// 	message = 'Connectez vous ou créez votre compte pour Créer votre espace club.';
				// 	break;
				case request.nextUrl.pathname.startsWith('/mes-dons'):
					message =
						'Connectez vous ou créez votre compte pour accéder à votre liste de dons et récupérer vos reçus.';
					break;
				default:
					message = 'Connectez vous ou créez votre compte pour accéder à cette page.';
					break;
			}
			const response = NextResponse.redirect(
				new URL(`/connexion?redirect=${request.nextUrl.pathname}&${search}`, request.url),
			);
			response.cookies.set('message', message, { path: '/', maxAge: 10 * 60 });
			return response;
		}
		if (isProtectedNoAuth && isConnected) {
			const cookieSearch = new URLSearchParams(request.cookies.get('redirectAfterAuth')?.value);
			let url = search.get('redirect') || cookieSearch.get('redirect') || '/';
			search.delete('redirect');
			cookieSearch.delete('redirect');
			const response = NextResponse.redirect(
				new URL(`${url}?${[...search.keys()].length ? search : cookieSearch}`, request.url),
			);
			response.cookies.delete('redirectAfterAuth');
			response.cookies.delete('message');
			return response;
		}
	}

	if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod') {
		const redirs = ['/clubs'];
		if (redirs.some((_) => request.nextUrl.pathname.startsWith(_))) {
			return NextResponse.redirect(new URL('/', request.url));
		}
	}

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set('x-custom-pathname', request.nextUrl.pathname);
	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
	if (request.nextUrl.pathname === '/connexion' && request.nextUrl.search?.length > 0) {
		response.cookies.set('redirectAfterAuth', request.nextUrl.search, {
			maxAge: 10 * 60,
		});
	}
	return response;
}

async function manageWC(request: NextRequest) {
	const response = NextResponse.next();
	try {
		const apiToken = request.nextUrl.searchParams.get('apiToken');
		const secret = new TextEncoder().encode(process.env.JWT_SECRET);
		const decrypted = await jwtVerify(String(apiToken), secret);
		console.log({
			origin: request.headers.get('origin'),
			decrypt: decrypted.payload.host,
		});
		if (decrypted) {
			if (
				[
					decrypted.payload.host,
					`http://${decrypted.payload.host}`,
					`https://${decrypted.payload.host}`,
				].includes(request.headers.get('origin') || request.nextUrl.origin)
			) {
				if (request.headers.get('origin') || request.nextUrl.origin) {
					if (request.method === 'OPTIONS') {
						return new NextResponse(null, {
							status: 204,
							headers: {
								'Access-Control-Allow-Origin':
									request.headers.get('origin') || request.nextUrl.origin,
								'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
								'Access-Control-Allow-Headers': 'Content-Type, Authorization',
								'Access-Control-Allow-Credentials': 'true',
							},
						});
					}
					response.headers.set(
						'Access-Control-Allow-Origin',
						request.headers.get('origin') || request.nextUrl.origin,
					);
					response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
					response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
					response.headers.set('Access-Control-Allow-Credentials', 'true');
				}
			} else {
				throw new Error(
					`Host is not allowed ${request.headers.get('origin')} ${request.nextUrl.origin} ${decrypted.payload.host}`,
					{
						cause: 'HOST',
					},
				);
			}
			if (!request.nextUrl.pathname.includes(String(decrypted.payload.web_component))) {
				if (!request.nextUrl.pathname.startsWith('/api/create-payment-intent')) {
					throw new Error('You are not subscribed to this web_component', {
						cause: 'WEB_COMPONENT',
					});
				}
			}
		} else {
			throw new Error('Api key is not valid', {
				cause: 'TOKEN',
			});
		}
		return response;
	} catch (e: any) {
		let message: string = 'Api key is not valid';
		if (e && e?.message) {
			message = e.message;
		}
		return new NextResponse(JSON.stringify({ message }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
}
