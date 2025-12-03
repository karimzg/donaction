import GetServerCookie from '@/core/helpers/getServerCookie';
import GetClientCookie from '@/core/helpers/getClientCookie';

export default function GetCookie(cookieName: string) {
	return typeof window === 'undefined' ? GetServerCookie(cookieName) : GetClientCookie(cookieName);
}
