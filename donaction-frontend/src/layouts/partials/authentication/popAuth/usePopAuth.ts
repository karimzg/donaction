'use client';
import { useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { selectPopAuth, setPopAuth } from '@/core/store/modules/rootSlice';
import { useState } from 'react';

export default function usePopAuth() {
	const [isLoginForm, setIsLoginForm] = useState(true);
	const { status, data } = useSession();
	const isOpen = useAppSelector(selectPopAuth);
	const dispatch = useAppDispatch();

	function closePopAuth() {
		dispatch(setPopAuth(''));
	}

	function changeForm() {
		setIsLoginForm((val) => !val);
	}

	return {
		isOpen,
		status,
		changeForm,
		isLoginForm,
		closePopAuth,
	};
}
