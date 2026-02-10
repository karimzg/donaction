import { KlubrMembre, KlubrMembreRole } from '@/core/models/klubr-membre';

export const ROLE_LABELS: Record<KlubrMembreRole, string> = {
	Admin: 'Super admin',
	AdminEditor: 'Administrateur',
	NetworkLeader: 'Responsable réseau',
	KlubMemberLeader: 'Dirigeant',
	KlubMember: 'Membre',
};

export const ADMIN_ROLES: Set<string> = new Set([
	'Admin',
	'AdminEditor',
	'NetworkLeader',
	'KlubMemberLeader',
]);

/**
 * Returns the best display name from session data.
 * Priority: nom > prenom > email local part > empty string.
 */
export function getDisplayName(data: {
	nom?: string | null;
	prenom?: string | null;
	email?: string | null;
} | null): string {
	if (!data) return '';
	if (data.nom) return data.nom;
	if (data.prenom) return data.prenom;
	if (data.email) return data.email.split('@')[0];
	return '';
}

/**
 * Returns the active KlubrMembre profile based on last_member_profile_used uuid.
 * Falls back to first member, or undefined if array is empty.
 */
export function getActiveProfile(
	klubrMembres: Array<KlubrMembre> | undefined | null,
	lastProfileUsed: string | null | undefined,
): KlubrMembre | undefined {
	if (!klubrMembres || klubrMembres.length === 0) return undefined;

	if (lastProfileUsed) {
		const match = klubrMembres.find(
			(m) => m.uuid === lastProfileUsed,
		);
		if (match) return match;
	}

	return klubrMembres[0];
}
