'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { popToast, pushToast, selectToasts } from '@/core/store/modules/rootSlice';
import './index.scss';

const Toaster = () => {
	const dispatch = useAppDispatch();
	const toastsSelector = useAppSelector(selectToasts);
	const [toasts, setToasts] = useState<typeof toastsSelector>([]);

	// TODO: This is for testing
	useEffect(() => {
		// setTimeout(() => {
		// 	dispatch(pushToast({ title: `Toast 1: info`, type: 'info' }));
		// }, 1000);
		// setTimeout(() => {
		// 	dispatch(pushToast({ title: `Toast 2: error`, type: 'error' }));
		// }, 2000);
		// setTimeout(() => {
		// 	dispatch(pushToast({ title: `Toast 3: success`, type: 'success' }));
		// }, 3000);
		// setTimeout(() => {
		// 	dispatch(pushToast({ title: `Toast 4: warning`, type: 'warning' }));
		// }, 4000);
	}, []);
	// /\ \\

	useEffect(() => {
		toastsSelector.forEach((_) => {
			if (!toasts.find((toast) => toast.id === _.id)) {
				toasts.push(_);
				setTimeout(() => {
					dispatch(popToast(_.id));
					toasts.filter((__) => __.id !== _.id);
				}, 4100);
			}
		});
	}, [toastsSelector]);

	return (
		<>
			{toastsSelector.map((toast, _index) => (
				<div
					className={`toastItem ${toast.type}`}
					style={{ bottom: 2 + 4 * _index + `rem` }}
					key={toast.id}
				>
					{toast.title}
				</div>
			))}
		</>
	);
};

export default Toaster;
