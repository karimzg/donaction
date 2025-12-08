import { KlubrMembre } from '@/core/models/klubr-membre';
import { Avatar } from '@/core/services/entities';

export interface UserDetail {
	id: number;
	uuid: string;
	username: string;
	email: string;
	provider: string;
	confirmed: boolean;
	blocked: boolean;
	lastLogin: string | null;
	status: string;
	origine: string;
	optin: boolean;
	nom?: string;
	prenom?: string;
	createdAt: string;
	updatedAt: string;
	klubr_membres: Array<KlubrMembre>;
	last_member_profile_used: string | null;
	avatar?: Avatar;
	role?: {
		name?: string;
		type?: string;
	};
	// for Google auth
	image?: string | null;
	//
}
