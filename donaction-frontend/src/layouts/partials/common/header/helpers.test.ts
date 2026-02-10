import { describe, it, expect } from 'vitest';
import { getDisplayName, getActiveProfile } from './helpers';
import { KlubrMembre } from '@/core/models/klubr-membre';

describe('getDisplayName', () => {
	it('returns nom when present', () => {
		expect(getDisplayName({ nom: 'Dupont', prenom: 'Jean', email: 'j@test.com' })).toBe('Dupont');
	});

	it('returns prenom when nom is absent', () => {
		expect(getDisplayName({ nom: null, prenom: 'Jean', email: 'j@test.com' })).toBe('Jean');
	});

	it('returns email local part when nom and prenom are absent', () => {
		expect(getDisplayName({ nom: null, prenom: null, email: 'jean.dupont@test.com' })).toBe('jean.dupont');
	});

	it('returns empty string when all fields are null', () => {
		expect(getDisplayName({ nom: null, prenom: null, email: null })).toBe('');
	});

	it('returns empty string when data is null', () => {
		expect(getDisplayName(null)).toBe('');
	});

	it('returns empty string when data fields are undefined', () => {
		expect(getDisplayName({})).toBe('');
	});
});

describe('getActiveProfile', () => {
	const makeMember = (uuid: number, role?: string): KlubrMembre => ({
		uuid,
		nom: 'Test',
		prenom: 'User',
		fonction: 'Dev',
		avatar: { url: '' } as any,
		role: role as any,
		klub_projets: { count: 0 },
	});

	it('returns matching profile by uuid', () => {
		const members = [makeMember(1, 'Admin'), makeMember(2, 'KlubMember')];
		const result = getActiveProfile(members, '2');
		expect(result?.uuid).toBe(2);
	});

	it('falls back to first member when no uuid match', () => {
		const members = [makeMember(1, 'Admin'), makeMember(2, 'KlubMember')];
		const result = getActiveProfile(members, '999');
		expect(result?.uuid).toBe(1);
	});

	it('falls back to first member when lastProfileUsed is null', () => {
		const members = [makeMember(1, 'Admin')];
		const result = getActiveProfile(members, null);
		expect(result?.uuid).toBe(1);
	});

	it('returns undefined for empty array', () => {
		expect(getActiveProfile([], null)).toBeUndefined();
	});

	it('returns undefined for null input', () => {
		expect(getActiveProfile(null, null)).toBeUndefined();
	});

	it('returns undefined for undefined input', () => {
		expect(getActiveProfile(undefined, undefined)).toBeUndefined();
	});
});
