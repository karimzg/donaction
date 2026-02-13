'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollAnimator from '@/components/ScrollAnimator';
import { useAppDispatch } from '@/core/store/hooks';
import { createReCaptchaToken, postNewsletters } from '@/core/services/cms';
import { pushToast } from '@/core/store/modules/rootSlice';
import { emailRexExp } from '@/partials/sponsorshipForm/logic/validations';
import './index.scss';

type ApiError = { error?: { status?: number; message?: string } };

const ALREADY_SUBSCRIBED_STATUS = 400;
const ALREADY_SUBSCRIBED_MESSAGE = 'This attribute must be unique';
const SUCCESS_TEXT = 'Merci pour votre inscription !';
const ALREADY_SUBSCRIBED_TEXT = 'Vous êtes déjà inscrit(e)';

function isApiError(error: unknown): error is ApiError {
	return typeof error === 'object' && error !== null && 'error' in error;
}

export default function NewHpNewsletter() {
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [statusMessage, setStatusMessage] = useState('');
	const isMounted = useRef(true);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		const trimmed = email.trim();
		if (!trimmed || !emailRexExp.test(trimmed)) {
			dispatch(pushToast({ type: 'error', title: 'Veuillez saisir un e-mail valide.' }));
			setStatusMessage('E-mail invalide.');
			return;
		}

		setIsLoading(true);
		setStatusMessage('Envoi en cours...');
		try {
			const formToken = await createReCaptchaToken('CREATE_NEWSLETTER_FORM');
			await postNewsletters({ data: { email: trimmed, formToken } });
			if (!isMounted.current) return;
			setSuccessMessage(SUCCESS_TEXT);
			setEmail('');
			setStatusMessage('Inscription réussie !');
			dispatch(
				pushToast({ type: 'success', title: 'Vous êtes désormais abonné à la newsletter !' }),
			);
		} catch (error: unknown) {
			if (!isMounted.current) return;
			if (
				isApiError(error) &&
				error.error?.status === ALREADY_SUBSCRIBED_STATUS &&
				error.error?.message === ALREADY_SUBSCRIBED_MESSAGE
			) {
				setSuccessMessage(ALREADY_SUBSCRIBED_TEXT);
				setEmail('');
				setStatusMessage('Déjà inscrit(e).');
			} else {
				setStatusMessage('Erreur, veuillez réessayer.');
				dispatch(pushToast({ type: 'error', title: 'Une erreur est survenue, réessayez.' }));
			}
		} finally {
			if (isMounted.current) {
				setIsLoading(false);
			}
		}
	}

	return (
		<section className="new-hp-newsletter w-full py-16 md:py-20 lg:py-24">
			<div className="max-w-[1320px] mx-auto px-6">
				<ScrollAnimator className="new-hp-newsletter__wrapper">
					<div className="new-hp-newsletter__content text-center max-w-2xl mx-auto">
						<div className="new-hp-newsletter__icon" aria-hidden="true">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
								<rect x="2" y="4" width="20" height="16" rx="2" />
								<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
							</svg>
						</div>

						<h2 className="new-hp-newsletter__title text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
							Restez informé
						</h2>

						<p className="new-hp-newsletter__subtitle text-gray-500 text-base md:text-lg mb-10 leading-relaxed">
							Recevez nos dernières actualités et conseils pour optimiser vos collectes.
						</p>

						<div role="status" aria-live="polite" className="sr-only">
							{statusMessage}
						</div>

						{successMessage ? (
							<div className="new-hp-newsletter__success">
								<svg className="new-hp-newsletter__success-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M20 6 9 17l-5-5" />
								</svg>
								<span className="text-gray-600 font-medium">{successMessage}</span>
							</div>
						) : (
							<form
								className="new-hp-newsletter__form"
								onSubmit={handleSubmit}
								noValidate
							>
								<div className="new-hp-newsletter__input-group">
									<label htmlFor="newsletter-email" className="sr-only">
										Adresse e-mail
									</label>
									<input
										id="newsletter-email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Saisissez votre e-mail"
										className="new-hp-newsletter__input"
										required
										disabled={isLoading}
										aria-label="Adresse e-mail pour la newsletter"
									/>
									<button
										type="submit"
										className="new-hp-newsletter__button"
										disabled={isLoading}
									>
										{isLoading ? (
											<span className="new-hp-newsletter__spinner" aria-hidden="true" />
										) : (
											"S'abonner"
										)}
									</button>
								</div>
								<p className="new-hp-newsletter__disclaimer text-gray-400 text-xs mt-4">
									Pas de spam, désinscription en un clic.
								</p>
							</form>
						)}
					</div>
				</ScrollAnimator>
			</div>
		</section>
	);
}
