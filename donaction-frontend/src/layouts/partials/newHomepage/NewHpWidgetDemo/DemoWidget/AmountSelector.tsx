'use client';

import { AmountSelectorProps } from '../types';
import {
  SUGGESTED_AMOUNTS_INDIVIDUAL,
  SUGGESTED_AMOUNTS_ORGANIZATION,
} from '../utils';

export default function AmountSelector({
  value,
  onChange,
  isOrganization,
}: AmountSelectorProps) {
  const amounts = isOrganization
    ? SUGGESTED_AMOUNTS_ORGANIZATION
    : SUGGESTED_AMOUNTS_INDIVIDUAL;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      onChange(Math.min(newValue, 100000));
    }
  };

  return (
    <div className="amount-selector">
      <p className="font-semibold text-gray-800 mb-4">Je souhaite donner :</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {amounts.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`amount-selector__btn px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
              value === amount
                ? 'border-[#73cfa8] bg-[#73cfa8]/10 text-[#3b9b75]'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
            onClick={() => onChange(amount)}
          >
            {amount} €
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="custom-amount" className="text-gray-600">
          Montant libre :
        </label>
        <div className="relative">
          <input
            id="custom-amount"
            type="number"
            min={1}
            max={100000}
            value={value}
            onChange={handleInputChange}
            className="w-28 text-center border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-[#73cfa8] focus:outline-none transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            €
          </span>
        </div>
      </div>
    </div>
  );
}
