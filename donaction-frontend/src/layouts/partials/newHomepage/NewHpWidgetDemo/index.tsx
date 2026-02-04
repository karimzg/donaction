'use client';

import { useState } from 'react';
import './index.scss';

const PRESET_AMOUNTS = [10, 25, 50, 100];
const TAX_REDUCTION_RATE = 0.66;

function calculateCostAfterTax(amount: number): string {
	if (isNaN(amount) || amount <= 0) return '0';
	const costAfterTax = amount - amount * TAX_REDUCTION_RATE;
	return costAfterTax.toFixed(2).replace(/\.00$/, '');
}

function calculateTaxSavings(amount: number): string {
	if (isNaN(amount) || amount <= 0) return '0';
	const savings = amount * TAX_REDUCTION_RATE;
	return savings.toFixed(2).replace(/\.00$/, '');
}

export default function NewHpWidgetDemo() {
	const [selectedAmount, setSelectedAmount] = useState<number>(50);
	const [customAmount, setCustomAmount] = useState<string>('');
	const [isCustom, setIsCustom] = useState(false);

	const activeAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;
	const costAfterTax = calculateCostAfterTax(activeAmount);
	const taxSavings = calculateTaxSavings(activeAmount);

	const handlePresetClick = (amount: number) => {
		setSelectedAmount(amount);
		setIsCustom(false);
		setCustomAmount('');
	};

	const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === '' || /^\d+$/.test(value)) {
			setCustomAmount(value);
			setIsCustom(true);
		}
	};

	const handleCustomFocus = () => {
		setIsCustom(true);
	};

	return (
		<section className="new-hp-widget-demo w-full py-16 md:py-24 bg-gray-50">
			<div className="w-full max-w-screen-xl mx-auto px-6">
				<div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
					{/* Text Content - Left */}
					<div className="lg:w-1/2 w-full">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Testez notre formulaire de don
						</h2>
						<p className="text-gray-600 text-lg mb-6">
							Découvrez la simplicité de notre widget de don. Saisissez un montant et voyez
							instantanément le calcul de votre réduction fiscale.
						</p>

						<ul className="new-hp-widget-demo__benefits" role="list">
							<li className="new-hp-widget-demo__benefit">
								<span className="new-hp-widget-demo__benefit-icon" aria-hidden="true">
									✨
								</span>
								<span>Réduction d&apos;impôt de 66% pour les particuliers</span>
							</li>
							<li className="new-hp-widget-demo__benefit">
								<span className="new-hp-widget-demo__benefit-icon" aria-hidden="true">
									🧾
								</span>
								<span>Reçu fiscal généré automatiquement</span>
							</li>
							<li className="new-hp-widget-demo__benefit">
								<span className="new-hp-widget-demo__benefit-icon" aria-hidden="true">
									🔒
								</span>
								<span>Paiement 100% sécurisé via Stripe</span>
							</li>
						</ul>
					</div>

					{/* Widget Demo - Right */}
					<div className="lg:w-1/2 w-full">
						<div
							className="new-hp-widget-demo__widget"
							role="region"
							aria-label="Simulateur de don"
						>
							<h3 className="new-hp-widget-demo__widget-title">Faites un don</h3>

							{/* Amount Selection */}
							<div className="new-hp-widget-demo__amounts" role="group" aria-label="Montant du don">
								{PRESET_AMOUNTS.map((amount) => (
									<button
										key={amount}
										type="button"
										className={`new-hp-widget-demo__amount-btn ${
											!isCustom && selectedAmount === amount ? 'active' : ''
										}`}
										onClick={() => handlePresetClick(amount)}
										aria-pressed={!isCustom && selectedAmount === amount}
									>
										{amount} &euro;
									</button>
								))}
								<div className="new-hp-widget-demo__custom-wrapper">
									<input
										type="text"
										inputMode="numeric"
										pattern="[0-9]*"
										placeholder="Autre"
										value={customAmount}
										onChange={handleCustomChange}
										onFocus={handleCustomFocus}
										className={`new-hp-widget-demo__custom-input ${isCustom ? 'active' : ''}`}
										aria-label="Montant personnalisé en euros"
									/>
									<span className="new-hp-widget-demo__custom-suffix">&euro;</span>
								</div>
							</div>

							{/* Fiscal Calculation */}
							<div className="new-hp-widget-demo__fiscal" aria-live="polite">
								<div className="new-hp-widget-demo__fiscal-row">
									<span className="text-gray-600">Montant du don</span>
									<span className="font-semibold" data-testid="amount-display">
										{activeAmount} &euro;
									</span>
								</div>
								<div className="new-hp-widget-demo__fiscal-row new-hp-widget-demo__fiscal-row--highlight">
									<span className="text-gray-600">Réduction d&apos;impôt (66%)</span>
									<span className="font-semibold text-secondary" data-testid="tax-savings">
										- {taxSavings} &euro;
									</span>
								</div>
								<div className="new-hp-widget-demo__fiscal-divider" />
								<div className="new-hp-widget-demo__fiscal-row new-hp-widget-demo__fiscal-row--total">
									<span className="font-semibold">Coût réel après impôt</span>
									<span className="font-bold text-xl" data-testid="cost-after-tax">
										{costAfterTax} &euro;
									</span>
								</div>
							</div>

							{/* Demo CTA */}
							<button
								type="button"
								className="new-hp-widget-demo__cta"
								disabled
								aria-disabled="true"
							>
								<span>Donner {activeAmount > 0 ? `${activeAmount} €` : ''}</span>
								<span className="new-hp-widget-demo__cta-badge">Mode démo</span>
							</button>

							<p className="new-hp-widget-demo__disclaimer">
								Ceci est une démonstration. Aucun paiement ne sera effectué.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
