import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { SponsorItem } from '@/partials/clubPage/ourSponsors';
import { Pagination } from '@/core/models/misc';

export interface ISponsorList {
	data: Array<SponsorItem>;
	pagination: Pagination;
}

interface ISponsorFetchConfig {
	uuid: string;
	byKlubOrProject: 'byKlub' | 'byProject';
}

interface IInitialState {
	sponsorsList: ISponsorList;
	sponsorsFetchConfig: ISponsorFetchConfig;
}

const initialState: IInitialState = {
	sponsorsList: {
		data: [],
		pagination: {
			total: 0,
			pageSize: 8,
			pageCount: 0,
			currentPage: 1,
		},
	},
	sponsorsFetchConfig: {
		uuid: '',
		byKlubOrProject: 'byKlub',
	},
};

export const sponsorsSlice = createSlice({
	name: 'sponsors',
	initialState,
	reducers: {
		setSponsorsList: (state, action: PayloadAction<ISponsorList>) => {
			localStorage.setItem('SPONSORS_LIST', JSON.stringify(action.payload));
			state.sponsorsList = action.payload;
		},
		setSponsorsFetchConfig: (state, action: PayloadAction<ISponsorFetchConfig>) => {
			state.sponsorsFetchConfig = action.payload;
		},
	},
});

export const { setSponsorsList, setSponsorsFetchConfig } = sponsorsSlice.actions;

export const selectSponsorsList = (state: RootState) => state.sponsors.sponsorsList;
export const selectSponsorsFetchConfig = (state: RootState) => state.sponsors.sponsorsFetchConfig;

export default sponsorsSlice.reducer;
