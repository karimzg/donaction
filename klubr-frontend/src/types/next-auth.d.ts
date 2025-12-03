import NextAuth, { ISODateString } from 'next-auth';
import { UserDetail } from '@/core/models/user';

declare module 'next-auth' {
	interface Session extends UserDetail {
		token: string;
		logout: boolean;
		expires: ISODateString;
	}
}
