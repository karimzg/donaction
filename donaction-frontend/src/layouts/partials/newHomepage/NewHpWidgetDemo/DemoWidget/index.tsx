'use client';

import { useState, useMemo } from 'react';
import AmountSelector from './AmountSelector';
import DonorTypeToggle from './DonorTypeToggle';
import TaxCalculationDisplay from './TaxCalculationDisplay';
import DemoBlocker from './DemoBlocker';
import { calculateDemoTaxReduction } from '../utils';
import './index.scss';

const DEFAULT_AMOUNT = 50;

export default function DemoWidget() {
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT);
  const [isOrganization, setIsOrganization] = useState<boolean>(false);
  const [showBlocker, setShowBlocker] = useState<boolean>(false);

  const taxResult = useMemo(
    () => calculateDemoTaxReduction(amount, isOrganization),
    [amount, isOrganization]
  );

  const handleContinue = () => {
    setShowBlocker(true);
  };

  return (
    <>
      <div className="demo-widget relative">
        {/* Demo Badge */}
        <span className="demo-widget__badge absolute -top-3 -right-3 bg-[#fb9289] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          Mode Démo
        </span>

        <div className="demo-widget__inner bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          {/* Header */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">
              Simulez votre don
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Découvrez votre avantage fiscal en temps réel
            </p>
          </div>

          {/* Donor Type Toggle */}
          <div className="mb-6">
            <DonorTypeToggle
              isOrganization={isOrganization}
              onChange={setIsOrganization}
            />
          </div>

          {/* Amount Selector */}
          <div className="mb-6">
            <AmountSelector
              value={amount}
              onChange={setAmount}
              isOrganization={isOrganization}
            />
          </div>

          {/* Tax Calculation Display */}
          <div className="mb-6">
            <TaxCalculationDisplay result={taxResult} />
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full bg-[#73cfa8] hover:bg-[#5bb892] text-white font-semibold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-[#73cfa8]/25"
          >
            Continuer →
          </button>

          {/* Security Note */}
          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Paiement sécurisé par Stripe
          </p>
        </div>
      </div>

      {showBlocker && <DemoBlocker onClose={() => setShowBlocker(false)} />}
    </>
  );
}
