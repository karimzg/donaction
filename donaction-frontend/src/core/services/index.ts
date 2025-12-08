import { ExecutorInterface } from './entities';

type ExtendedRequestInit = RequestInit & {
	next?: {
		tags?: string[];
	};
};

const HttpService = {
	async ExecuteRequest(conf: ExecutorInterface): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const getStrapiUrl = () => {
					return typeof window === 'undefined'
						? process.env.NEXT_PUBLIC_SERVER_COMPONENTS_DEV_API_URL
						: process.env.NEXT_PUBLIC_API_URL;
				};
				const fetchOptions: ExtendedRequestInit = {
					method: conf.useDefaultHttp ? conf.method || 'GET' : 'POST',
					headers: new Headers({
						Accept: 'application/json, application/xml, text/plain, text/html, *.*',
						Authorization: `Bearer ${String(process.env.NEXT_PUBLIC_STRAPI_API_TOKEN)}`,
						...(conf.isFormData
							? {}
							: {
									'Content-Type': 'application/json',
								}),
						...conf.headers,
					}),
					body: conf.data instanceof FormData ? conf.data : JSON.stringify(conf || {}),
					next: { tags: conf.tags || undefined },
					cache: !!conf?.cookies ? 'no-cache' : conf.noCache ? 'no-cache' : 'default',
				};
				if (conf.useDefaultHttp && (conf?.method?.toUpperCase() === 'GET' || !conf.method)) {
					delete fetchOptions.body;
				}
				const response = await fetch(
					`${conf.isFormData || conf.useDefaultHttp ? getStrapiUrl() : process.env.NEXT_CONTAINER_SITE_URL}${conf.endPoint}`,
					fetchOptions,
				);

				if (response.ok) {
					let res = null;
					if (conf.responseType === 'blob') {
						res = await response.blob();
						resolve({
							data: res,
							contentDisposition: response.headers.get('content-disposition') || '',
						});
					} else {
						res = await response.json();
						resolve(res);
					}
				} else {
					const res = await response.json();
					reject(res);
				}
			} catch (e) {
				reject(e);
			}
		});
	},
};

export default HttpService;
