'use client';

import { TaxCalculationDisplayProps } from '../types';

function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function TaxCalculationDisplay({
  result,
}: TaxCalculationDisplayProps) {
  return (
    <div className="tax-display bg-gradient-to-br from-[#73cfa8]/5 to-[#73cfa8]/10 rounded-xl p-6 border border-[#73cfa8]/20">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-gray-800">
          Coût réel après réduction d&apos;impôts
        </h3>
        <span title="Le montant que vous coûtera réellement ce don après déduction fiscale">
          <InfoIcon />
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-4xl font-bold text-[#73cfa8]">
          {result.costAfterTax.toFixed(2)} €
        </span>
        <span className="text-gray-400 line-through text-lg">
          {result.originalAmount.toFixed(2)} €
        </span>
      </div>

      <div className="flex items-center gap-2 text-gray-600">
        <svg className="w-5 h-5 text-[#73cfa8]" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>
          Vous économisez{' '}
          <strong className="text-[#3b9b75]">
            {result.taxReduction.toFixed(2)} €
          </strong>
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-3">
        Réduction fiscale de {Math.round(result.taxRate * 100)}% pour les{' '}
        {result.donorType === 'particulier' ? 'particuliers' : 'entreprises'}
      </p>
    </div>
  );
}
