'use client';

import { DonorTypeToggleProps } from '../types';

export default function DonorTypeToggle({
  isOrganization,
  onChange,
}: DonorTypeToggleProps) {
  return (
    <div className="donor-type-toggle">
      <p className="font-semibold text-gray-800 mb-3">Je suis :</p>

      <div
        className="flex rounded-lg border-2 border-gray-200 overflow-hidden"
        role="radiogroup"
        aria-label="Type de donateur"
      >
        <button
          type="button"
          role="radio"
          aria-checked={!isOrganization}
          className={`flex-1 px-4 py-2.5 font-medium transition-all ${
            !isOrganization
              ? 'bg-donaction-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => onChange(false)}
        >
          Particulier
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isOrganization}
          className={`flex-1 px-4 py-2.5 font-medium transition-all ${
            isOrganization
              ? 'bg-donaction-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => onChange(true)}
        >
          Entreprise
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {isOrganization
          ? 'Réduction fiscale de 60% (IS)'
          : 'Réduction fiscale de 66% (IR)'}
      </p>
    </div>
  );
}
