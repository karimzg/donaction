import { checkUserExistence } from '@/core/services/auth';
import { pushToast, setPopAuth } from '@/core/store/modules/rootSlice';

export function checkExistence(
	value: string,
	dispatch: Function,
	status: 'loading' | 'authenticated' | 'unauthenticated',
) {
	if (value && status === 'unauthenticated') {
		checkUserExistence(String(value))
			.then((res) => {
				if (res?.provider) {
					dispatch(setPopAuth(String(value)));
				}
			})
			.catch((err) => {
				console.log(err);
				dispatch(
					pushToast({
						type: 'error',
						title: err?.error?.message || "Une erreur s'est produite",
					}),
				);
			});
	}
}
