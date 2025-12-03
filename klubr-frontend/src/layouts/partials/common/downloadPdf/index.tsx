'use client';

import { getFileNameFromContentDisposition } from '@/core/helpers/getFileNameFromContentDisposition';
import { getDonAttestationPdf, getDonRecuPdf } from '@/core/services/don-pdf';
import Image from 'next/image';
import download from '../../../../../public/images/icons/download.svg';
import invoice from '../../../../../public/images/icons/invoice.svg';
import DropdownList from '@/components/dropdownList';
import React from 'react';
import { sendGaEvent } from '@/core/helpers/sendGaEvent';

const downloadPdf = ({
	uuid,
	toggler,
	position,
	withTaxReduction,
	contributionUuid,
}: {
	uuid: string;
	position: string;
	contributionUuid?: string;
	withTaxReduction?: boolean;
	toggler: React.ReactElement;
}) => {
	const getPdf = (acc: number) => {
		const downloadRes = (res: { data: Blob; contentDisposition: string }) => {
			if (res.data instanceof Blob) {
				const url = window.URL.createObjectURL(res.data);
				const link = document.createElement('a');
				link.href = url;
				link.target = 'blank';
				link.download = getFileNameFromContentDisposition(res.contentDisposition);
				document.body.appendChild(link);
				link.click();
				// Cleansing;
				document.body.removeChild(link);
			}
		};
		switch (acc) {
			case 0:
				sendGaEvent({
					category: 'Donations',
					label: `Download recu (${uuid})`,
				});
				getDonRecuPdf(uuid)
					.then((res) => {
						downloadRes(res);
					})
					.catch((err) => {
						sendGaEvent({
							category: 'Error Donations',
							label: `Download recu (${uuid})`,
						});
					});
				break;
			case 2:
				sendGaEvent({
					category: 'Donations',
					label: `Download recu (${contributionUuid})`,
				});
				getDonRecuPdf(contributionUuid || '')
					.then((res) => {
						downloadRes(res);
					})
					.catch((err) => {
						sendGaEvent({
							category: 'Error Donations',
							label: `Download recu (${contributionUuid})`,
						});
					});
				break;
			case 1:
				sendGaEvent({
					category: 'Donations',
					label: `Download att (${uuid})`,
				});
				getDonAttestationPdf(uuid)
					.then((res) => {
						downloadRes(res);
					})
					.catch(() => {
						sendGaEvent({
							category: 'Error Donations',
							label: `Download att (${uuid})`,
						});
					});
				break;
		}
	};
	return (
		<DropdownList toggler={toggler} listPosition={position}>
			<ul className='p-0 w-max'>
				{withTaxReduction ? (
					<>
						<li className='px-4 py-1 mt-2 cursor-pointer' onClick={() => getPdf(0)}>
							<div className='font-medium text-md flex flex-row items-center gap-4'>
								<div className='p-3 rounded-full bg-[#E4E4E5]'>
									<Image width={20} height={16} src={invoice as string} alt={'photo'} />
								</div>

								<p>Télécharger le reçu fiscal</p>
							</div>
						</li>
						{contributionUuid ? (
							<li className='px-4 py-1 mt-2 cursor-pointer' onClick={() => getPdf(2)}>
								<div className='font-medium text-md flex flex-row items-center gap-4'>
									<div className='p-3 rounded-full bg-[#E4E4E5]'>
										<Image width={20} height={16} src={invoice as string} alt={'photo'} />
									</div>

									<p>
										Télécharger le reçu fiscal
										<br /> de contribution
									</p>
								</div>
							</li>
						) : (
							<></>
						)}
					</>
				) : (
					<></>
				)}
				<li className='px-4 py-1 mt-2 cursor-pointer' onClick={() => getPdf(1)}>
					<div className='font-medium text-md flex flex-row items-center gap-4'>
						<div className='p-3 rounded-full bg-[#E4E4E5]'>
							<Image width={20} height={16} src={invoice as string} alt={'photo'} />
						</div>

						<p>
							Télécharger l'attestation <br /> de paiement
						</p>
					</div>
				</li>
				{/*<li className='px-4 py-1 mb-2 cursor-pointer' onClick={downloadAtt}>*/}
				{/*	<div className='font-medium text-md flex flex-row items-center gap-4'>*/}
				{/*		<div className='p-3 rounded-full bg-[#E4E4E5]'>*/}
				{/*			<Image width={20} height={19} src={convention as string} alt={'avatar'} />*/}
				{/*		</div>*/}

				{/*		<p>Télécharger la convention de mécénat</p>*/}
				{/*	</div>*/}
				{/*</li>*/}
			</ul>
		</DropdownList>
	);
};

export default downloadPdf;
