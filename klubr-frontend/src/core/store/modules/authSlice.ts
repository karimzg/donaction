import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Session } from 'next-auth';

interface IUseSession {
	data: Omit<Session, 'user'> | null;
	status: 'loading' | 'authenticated' | 'unauthenticated';
}
interface IInitialState {
	session: IUseSession;
}

const initialState: IInitialState = {
	session: {
		data: null,
		status: 'loading',
	},
};

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setSession: (state, action: PayloadAction<IUseSession>) => {
			state.session = { ...action.payload };
		},
	},
});

export const { setSession } = authSlice.actions;

export const selectSession = (state: RootState) => state.auth.session;

export default authSlice.reducer;
