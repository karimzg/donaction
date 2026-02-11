import { headers } from 'next/headers';

/**
 * Retrieves the current pathname from request headers (server)
 * or from `document.location` (client fallback).
 */
const getPathname = (): string => {
	try {
		const headersList = headers();
		return headersList.get('x-custom-pathname') || '';
	} catch {
		return typeof window !== 'undefined' ? document?.location.pathname : '';
	}
};

export default getPathname;
