'use client';

import { usePathname } from 'next/navigation';
import React, { ReactNode, useEffect, useRef } from 'react';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { setSession } from '@/core/store/modules/authSlice';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import { AppStore, makeStore } from '@/core/store';
import { Provider } from 'react-redux';

const Providers = ({ children }: { children: ReactNode }) => {
	const pathname = usePathname();

	useEffect(() => {
		window.scroll(0, 0);
	}, [pathname]);

	return (
		<SessionProvider>
			<StoreProvider>
				<PrimeReactProvider>{children}</PrimeReactProvider>
			</StoreProvider>
		</SessionProvider>
	);
};

function StoreProvider({ children }: { children: React.ReactNode }) {
	const storeRef = useRef<AppStore | null>(null);
	const { data, status } = useSession();

	if (!storeRef.current) {
		storeRef.current = makeStore();
	}

	useEffect(() => {
		if (status !== 'loading') {
			const urlParams = new URLSearchParams(location.search);
			if ((data && data.logout) || urlParams.get('logout')) {
				if (urlParams.get('logout')) {
					window.history.replaceState({}, document.title, location.pathname);
				}
				signOut().then();
			} else {
				if (storeRef.current) {
					storeRef.current.dispatch(
						setSession({
							data,
							status,
						}),
					);
				}
			}
		}
	}, [status]);

	return <Provider store={storeRef.current}>{children}</Provider>;
}

export default Providers;
