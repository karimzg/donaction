'use server';
import { cookies } from 'next/headers';
export default async function GetServerCookie(cookieName: string): Promise<string | null> {
	const cookieStore = cookies();
	return cookieStore.get(cookieName)?.value || null;
}
