import { describe, it, expect } from 'vitest';
import reducer, { pushToast, popToast, MAX_VISIBLE_TOASTS } from './rootSlice';

const makeInitialState = (toasts: Array<{ id: string; title: string; type: 'success' }> = []) => ({
	isRootLoading: false,
	currentLanguage: 'fr',
	popAuth: '',
	toasts,
	isDonationCguShown: false,
});

describe('rootSlice — toast stacking', () => {
	it('exports MAX_VISIBLE_TOASTS as 3', () => {
		expect(MAX_VISIBLE_TOASTS).toBe(3);
	});

	it('pushes a toast when under capacity', () => {
		const state = makeInitialState();
		const next = reducer(state, pushToast({ id: 'a', title: 'Hello', type: 'success' }));
		expect(next.toasts).toHaveLength(1);
		expect(next.toasts[0].title).toBe('Hello');
	});

	it('allows up to MAX_VISIBLE_TOASTS', () => {
		let state = makeInitialState();
		state = reducer(state, pushToast({ id: 'a', title: 'First', type: 'success' }));
		state = reducer(state, pushToast({ id: 'b', title: 'Second', type: 'success' }));
		state = reducer(state, pushToast({ id: 'c', title: 'Third', type: 'success' }));
		expect(state.toasts).toHaveLength(3);
	});

	it('evicts oldest toast when pushing beyond MAX_VISIBLE_TOASTS', () => {
		let state = makeInitialState();
		state = reducer(state, pushToast({ id: 'a', title: 'First', type: 'success' }));
		state = reducer(state, pushToast({ id: 'b', title: 'Second', type: 'success' }));
		state = reducer(state, pushToast({ id: 'c', title: 'Third', type: 'success' }));
		state = reducer(state, pushToast({ id: 'd', title: 'Fourth', type: 'success' }));

		expect(state.toasts).toHaveLength(3);
		expect(state.toasts.map((t) => t.id)).toEqual(['b', 'c', 'd']);
		expect(state.toasts.map((t) => t.title)).toEqual(['Second', 'Third', 'Fourth']);
	});

	it('evicts multiple if somehow state exceeds capacity', () => {
		// Simulate a state with 4 toasts already (edge case)
		const state = makeInitialState([
			{ id: 'a', title: 'A', type: 'success' },
			{ id: 'b', title: 'B', type: 'success' },
			{ id: 'c', title: 'C', type: 'success' },
			{ id: 'd', title: 'D', type: 'success' },
		]);
		const next = reducer(state, pushToast({ id: 'e', title: 'E', type: 'success' }));

		expect(next.toasts).toHaveLength(3);
		expect(next.toasts[next.toasts.length - 1].id).toBe('e');
	});

	it('popToast removes a specific toast by id', () => {
		let state = makeInitialState();
		state = reducer(state, pushToast({ id: 'a', title: 'A', type: 'success' }));
		state = reducer(state, pushToast({ id: 'b', title: 'B', type: 'success' }));
		state = reducer(state, popToast('a'));

		expect(state.toasts).toHaveLength(1);
		expect(state.toasts[0].id).toBe('b');
	});
});
