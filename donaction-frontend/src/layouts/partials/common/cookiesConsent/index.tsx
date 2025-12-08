'use client';
import React, { useEffect, useRef, useState } from 'react';
import './index.scss';
import lock from '../../../../../public/images/icons/lock.svg';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronDown } from 'react-icons/fa';
import GetClientCookie, { SetClientCookie } from '@/core/helpers/getClientCookie';

interface IKlubrCookiesConsent {
	acceptAll: boolean;
	options: {
		necessary: boolean;
		statistics: boolean;
	};
}

const CookiesConsent: React.FC = () => {
	const cookiesRef = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	const [extended, setExtended] = useState(false);
	const [accordion, setAccordion] = useState({
		0: false,
		1: false,
	});
	const [state, setState] = useState<IKlubrCookiesConsent>({
		acceptAll: true,
		options: {
			necessary: true,
			statistics: true,
		},
	});

	useEffect(() => {
		if (!GetClientCookie('KlubrCookiesConsent')) {
			document.body.style.overflow = 'hidden';
			setVisible(true);
		}
		return () => {
			document.body.style.overflow = 'auto';
		};
	}, []);

	const check = () => {
		setState((_) => ({
			..._,
			options: {
				..._.options,
				statistics: !_.options.statistics,
			},
		}));
	};

	const view = (acc: 0 | 1) => {
		setAccordion((_) => ({
			..._,
			[acc]: !_[acc],
		}));
	};

	useEffect(() => {
		if (extended && !!cookiesRef.current) {
			cookiesRef.current.scrollTo({
				top: cookiesRef.current.scrollHeight,
				behavior: 'smooth',
			});
		}
	}, [extended, accordion]);

	const save = (acc: 1 | -1) => {
		if (acc < 0 && !extended) {
			setExtended(true);
			return;
		}
		document.body.style.overflow = 'auto';
		SetClientCookie(
			'KlubrCookiesConsent',
			JSON.stringify({
				acceptAll: acc > 0,
				options: {
					necessary: true,
					statistics: acc > 0 || state.options.statistics,
				},
			} as IKlubrCookiesConsent),
			acc < 0 ? 1 : 365,
		);
		setVisible(false);
	};

	return (
		<>
			{visible && (
				<div
					className={`cookiesPopUpContainer text-black flex flex-col items-start gap-4 boxBoxShadow`}
				>
					<h2 className={'ml-4 font-semibold'}>Vos données, votre choix !</h2>
					<hr className={'w-full border-black'} />
					<div
						ref={cookiesRef}
						className={'flex flex-col items-start gap-4 overflow-x-hidden overflow-y-auto pb-2'}
					>
						<Image src={lock} alt={'lock'} className={'self-center'} />
						<p className={'leading-[1.4rem]'}>
							Ce site utilise des cookies pour améliorer votre expérience utilisateur, analyser le
							trafic et assurer le bon fonctionnement de certaines fonctionnalités. Certains cookies
							sont nécessaires, comme ceux utilisés pour la connexion à votre espace membre. Nous
							utilisons également des cookies de performance (comme Google Analytics) pour mieux
							comprendre comment notre site est utilisé. Vous pouvez accepter tous les cookies,
							refuser les cookies de performance ou en savoir plus sur notre{' '}
							<Link className={'font-semibold underline'} href={'/politique-de-confidentialite'}>
								Politique de Confidentialité
							</Link>
							.
						</p>
						{extended && (
							<div className={'w-full flex flex-col gap-2 items-start'}>
								<div className={'flex justify-between items-center w-full'}>
									<p onClick={() => view(0)}>Nécessaire</p>
									<div className={'flex gap-2 items-center'}>
										<p className={'text-[#0EB13C]'}>Toujours activé</p>
										<FaChevronDown
											onClick={() => view(0)}
											className={`cursor-pointer accordion-icon min-w-[18px] ${accordion['0'] ? 'rotate-180' : ''}`}
										/>
									</div>
								</div>
								{accordion['0'] && (
									<p className={'leading-[1.4rem]'}>
										Les cookies nécessaires sont absolument indispensables au bon fonctionnement du
										site web. Ces cookies assurent les fonctionnalités de base, les caractéristiques
										de sécurité du site et collectent des données de performance de manière anonyme.
									</p>
								)}
								<div className={'flex justify-between items-center w-full'}>
									<p onClick={() => view(1)}>Statistiques</p>
									<div className={'flex gap-2 items-center'}>
										<div
											className={`${state.options.statistics ? 'bg-[#F1C21B]' : 'bg-[#CBCBCB]'} rounded-full w-[54px] h-[25px] relative cursor-pointer`}
											onClick={check}
											style={{
												transition: 'background .5s ease-in-out',
											}}
										>
											<span
												className={`w-[21px] h-[21px] absolute ${state.options.statistics ? 'left-[31px]' : 'left-[2px]'}  top-[2px] rounded-full bg-white`}
												style={{
													transition: 'left .3s ease-in-out',
												}}
											/>
										</div>
										<FaChevronDown
											onClick={() => view(1)}
											className={`cursor-pointer accordion-icon min-w-[18px] ${accordion['1'] ? 'rotate-180' : ''}`}
										/>
									</div>
								</div>
								{accordion['1'] && (
									<p className={'leading-[1.4rem]'}>
										Conformément à l’article 82 de la loi Informatique et Libertés, les cookies
										Google Analytics servent uniquement à mesurer notre audience et à collecter les
										données statistiques nécessaires pour optimiser les performances de notre site
										web. Vos interactions sont suivies de manière anonyme.Nous nous engageons à
										n'envoyer aucune donnée personnelle à Google Analytics. Nous nous engageons
										également à ne pas recibler nos visiteurs n’ayant pas donné leur accord à ce
										sujet. L'analyse statistique nous permet d'améliorer les performances de notre
										site web.
									</p>
								)}
							</div>
						)}
					</div>
					<div className={'grid min-[480px]:grid-cols-2 gap-2 w-full items-center'}>
						<button
							onClick={() => save(1)}
							className={'font-semibold py-2 bg-[#F1C21B] rounded-md'}
						>
							Accepter tous les cookies
						</button>
						<button
							onClick={() => save(-1)}
							className={'font-semibold py-2 bg-[#F1F1F1] rounded-md'}
						>
							{extended ? 'Enregistrer mes préférences' : 'Gérer mes préférences'}
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default CookiesConsent;
