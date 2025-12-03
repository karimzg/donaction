import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './modules/rootSlice';
import sponsorsReducer from './modules/sponsorsSlice';
import projectReducer from './modules/projectSlice';
import authReducer from './modules/authSlice';

export const makeStore = () => {
	return configureStore({
		reducer: {
			root: rootReducer,
			sponsors: sponsorsReducer,
			project: projectReducer,
			auth: authReducer,
		},
		// middleware: (getDefaultMiddleware) =>
		// 	getDefaultMiddleware({
		// 		serializableCheck: false,
		// 	}),
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
