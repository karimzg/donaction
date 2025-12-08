import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface IToast {
	title: string;
	type: 'info' | 'warn' | 'error' | 'success';
}

interface ID {
	id: string;
}

interface IInitialState {
	isRootLoading: boolean;
	currentLanguage: string;
	popAuth: string;
	toasts: Array<IToast & ID>;
	isDonationCguShown: boolean;
}

const initialState: IInitialState = {
	// example
	isRootLoading: false,
	currentLanguage: 'fr',
	popAuth: '',
	toasts: [],
	isDonationCguShown: false,
};

export const rootSlice = createSlice({
	name: 'root',
	initialState,
	reducers: {
		setRootLoading: (state, action: PayloadAction<boolean>) => {
			state.isRootLoading = action.payload;
		},
		setLanguage: (state, action: PayloadAction<string>) => {
			state.currentLanguage = action.payload;
		},
		setIsDonationCguShown: (state, action: PayloadAction<boolean>) => {
			state.isDonationCguShown = action.payload;
		},
		setPopAuth: (state, action: PayloadAction<string>) => {
			state.popAuth = action.payload;
		},
		pushToast: (state, action: PayloadAction<IToast>) => {
			state.toasts.push({
				...action.payload,
				id: Math.random().toString(36).slice(2, 10),
			});
		},
		popToast: (state, action: PayloadAction<string>) => {
			state.toasts = state.toasts.filter((_) => _.id !== action.payload);
		},
	},
});

export const {
	//
	setRootLoading,
	setLanguage,
	setIsDonationCguShown,
	setPopAuth,
	pushToast,
	popToast,
} = rootSlice.actions;

export const selectCurrentLanguage = (state: RootState) => state.root.currentLanguage;
export const selectRootLoading = (state: RootState) => state.root.isRootLoading;
export const selectPopAuth = (state: RootState) => state.root.popAuth;
export const selectToasts = (state: RootState) => state.root.toasts;
export const selectIsDonationCguShown = (state: RootState) => state.root.isDonationCguShown;

export default rootSlice.reducer;
