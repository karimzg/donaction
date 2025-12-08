import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SC_DEV } from '@/core/services/endpoints';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest, res: NextResponse) {
	try {
		const body = await req.json().catch(() => null);

		if (req.nextUrl.pathname.includes('/strapi-auth')) {
			req.nextUrl.pathname = req.nextUrl.pathname.replace('/strapi-auth', '/auth');
		}

		const { res, status } = await NextFetch({
			req,
			endPoint: `${req.nextUrl.pathname}${req.nextUrl.search}`,
			method: body?.method,
			data: body?.data,
			params: body?.params,
			headers: body?.headers,
			responseType: body?.responseType,
			revalidate: body?.revalidate,
			tags: body?.tags,
			noCache: body?.noCache,
			cookies: body?.cookies,
		});

		if (body?.responseType === 'blob') {
			const stream = res.data?.stream();
			const headers = new Headers({
				'Content-Type': res.data?.type,
				'Content-Disposition': res.contentDisposition,
			});
			return new NextResponse(stream, { headers });
		}

		return NextResponse.json(
			Array.isArray(res)
				? res
				: {
						...res,
					},
			{ status },
		);
	} catch (e) {
		let err: any = e;
		if (!err) {
			err = {
				error: '',
			};
		} else if (!!err?.res) {
			err = { ...err?.res };
		}

		return NextResponse.json(
			{
				...err,
			},
			{ status: err?.status || 400 },
		);
	}
}

type KlubrFetchType = {
	req: NextRequest;
	endPoint: string;
	method?: 'get' | 'post' | 'put' | 'delete';
	data?: Record<string, any>;
	params?: Record<string, string>;
	headers?: Record<string, any>;
	responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
	revalidate?: number;
	tags?: Array<string>;
	noCache?: boolean;
	cookies?: string;
};

type ExtendedRequestInit = RequestInit & {
	next?: {
		tags?: string[];
	};
};

async function NextFetch(conf: KlubrFetchType): Promise<{ res: any; status: number }> {
	return new Promise(async (resolve, reject) => {
		try {
			if (conf.cookies) {
				const cookiesList = conf.cookies.split(';');
				cookiesList.forEach((cookie) => {
					const [key, value] = cookie.split('=').map((part) => part.trim());
					if (key && value) {
						conf.req.cookies.set(key, decodeURIComponent(value));
					}
				});
			}
			const isPreviewMode = conf.req?.cookies?.get('isPreviewMode')?.value;
			let TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN as string;
			const constructedUrl = `${BASE_URL_SC_DEV}${conf.endPoint}${conf.params ? new URLSearchParams(conf.params) : ''}`;
			const USER_TOKEN_ENDPOINTS = [
				'/api/users',
				'/api/klub-dons/my-dons',
				'/api/klub-dons/relaunch',
				'/api/klubr-donateurs/my-last',
			];
			const USER_PREVIEW_ENDPOINTS = ['/api/klub-projets', '/api/klubrs'];
			if (
				USER_TOKEN_ENDPOINTS.some(
					(_) => conf.endPoint.startsWith(_) || conf.endPoint.includes('/preview'),
				) ||
				(USER_PREVIEW_ENDPOINTS.some((_) => conf.endPoint.startsWith(_)) && !!isPreviewMode)
			) {
				const t = await getToken({ req: conf.req });
				TOKEN = (t?.jwt as string) || TOKEN;
				// console.log('HERE USING USER TOKEN: ', {
				// 	isPreviewMode,
				// 	ENDPOINT: conf.endPoint,
				// 	TOKEN,
				// });
			} else {
				// console.log('HERE USING API TOKEN: ', {
				// 	isPreviewMode,
				// 	ENDPOINT: conf.endPoint,
				// 	TOKEN,
				// });
			}

			const fetchOptions: ExtendedRequestInit = {
				method: conf?.method || 'GET',
				headers: new Headers({
					Accept: 'application/json, application/xml, text/plain, text/html, *.*',
					Authorization: `Bearer ${TOKEN}`,
					'Content-Type': 'application/json',
					'Strapi-Response-Format':'v4',
					...conf.headers,
				}),
				body: JSON.stringify(conf.data),
				next: { tags: conf.tags || undefined },
				cache:
					TOKEN !== process.env.NEXT_PUBLIC_STRAPI_API_TOKEN
						? 'no-cache'
						: conf.noCache
							? 'no-cache'
							: 'default',
			};

			const response = await fetch(constructedUrl, fetchOptions);

			if (response.ok) {
				let res = null;
				if (conf.responseType === 'blob') {
					res = await response.blob();
					resolve({
						res: {
							data: res,
							contentDisposition: response.headers.get('content-disposition') || '',
						},
						status: response.status,
					});
				} else {
					res = await response.json();
					resolve({
						res,
						status: response.status,
					});
				}
			} else {
				const res = await response.json();
				reject({
					res,
					status: response.status,
				});
			}
		} catch (e) {
			reject({
				res: e,
				status: 500,
			});
		}
	});
}
