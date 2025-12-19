import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface IProgress {
	uuid: string;
	nbDons: number;
	montantTotalDonations: number;
}

interface IInitialState {
	progress: {
		[key: string]: IProgress;
	};
}

const initialState: IInitialState = {
	progress: {},
};

export const projectSlice = createSlice({
	name: 'project',
	initialState,
	reducers: {
		setProjectProgress: (state, action: PayloadAction<IProgress>) => {
			state.progress[action.payload.uuid] = action.payload;
		},
		incrementProjectProgress: (state, action: PayloadAction<{ inc: number; uuid: string }>) => {
			state.progress[action.payload.uuid] = {
				uuid: action.payload.uuid,
				nbDons: state.progress[action.payload.uuid].nbDons + 1,
				montantTotalDonations:
					state.progress[action.payload.uuid].montantTotalDonations + action.payload.inc,
			};
		},
	},
});

export const { setProjectProgress, incrementProjectProgress } = projectSlice.actions;

export const selectProjectProgress = (uuid: string) => (state: RootState) =>
	state.project.progress[uuid];

export default projectSlice.reducer;
