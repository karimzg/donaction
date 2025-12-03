'use client';

// '91217ebe-e0aa-42cd-8721-8bcd0eb73725';
import React, { useEffect } from 'react';
import { getDonAttestationPdf } from 'src/core/services/don-pdf';
import { getFileNameFromContentDisposition } from '@/core/helpers/getFileNameFromContentDisposition';

const Invoice: React.FC<{ uuid?: string }> = ({ uuid }) => {
	useEffect(() => {
		const closeWindow = () => {
			window.close();
		};
		if (uuid) {
			getDonAttestationPdf(uuid)
				.then((res) => {
					const blobFile = new Blob([res.data], { type: 'application/pdf' });

					if (blobFile instanceof Blob) {
						const url = window.URL.createObjectURL(blobFile);
						const link = document.createElement('a');
						link.href = url;
						link.download = getFileNameFromContentDisposition(res.contentDisposition || '');
						document.body.appendChild(link);
						link.click();
						// Cleansing;
						document.body.removeChild(link);
						window.URL.revokeObjectURL(url);
						closeWindow();
					} else closeWindow();
				})
				.catch(
					// TODO: Toasts ?
					(error: any) => {
						console.log(error);
					},
				);
		} else closeWindow();
	}, []);
	return <></>;
};

export default Invoice;
