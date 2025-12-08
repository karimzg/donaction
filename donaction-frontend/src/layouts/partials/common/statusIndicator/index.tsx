'use client';
import React, { useEffect, useState } from 'react';
import GetClientCookie from '@/core/helpers/getClientCookie';

const StatusIndicator: React.FC<{ status: string; uuid: string; css?: string }> = ({
	status,
	uuid,
	css,
}) => {
	const [isPreviewMode, setIsPreviewMode] = useState<null | string>(null);

	useEffect(() => {
		setIsPreviewMode(GetClientCookie('isPreviewMode'));
	}, []);

	const getStatus = () => {
		switch (status) {
			case 'draft':
			case 'creation':
				return {
					text: 'Brouillon',
					color: '#8312C8',
				};
			case 'closed':
				return {
					text: 'Clotûré',
					color: '#DF0D0D',
				};
			case 'deleted':
				return {
					text: 'Supprimé',
					color: '#DF0D0D',
				};
			case 'waitingApproval':
				return {
					text: 'En attente de validation',
					color: '#F79707',
				};
			default:
				return null;
		}
	};

	return (
		<>
			{!!isPreviewMode && isPreviewMode === uuid && getStatus() && (
				<p
					className={`px-4 py-2 bg-white rounded-full absolute z-10 boxBoxShadow ${css}`}
					style={{ color: getStatus()?.color }}
				>
					{getStatus()?.text}
				</p>
			)}
		</>
	);
};

export default StatusIndicator;
