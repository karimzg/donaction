'use client';

import { useMemo, useState } from 'react';
import { AmountSelectorProps } from '../types';
import {
  SUGGESTED_AMOUNTS_INDIVIDUAL,
  SUGGESTED_AMOUNTS_ORGANIZATION,
  MIN_DONATION_AMOUNT,
  MAX_DONATION_AMOUNT,
} from '../utils';

export default function AmountSelector({
  value,
  onChange,
  isOrganization,
}: AmountSelectorProps) {
  // Memoize amounts array to avoid recreation on every render
  const amounts = useMemo(
    () =>
      isOrganization ? SUGGESTED_AMOUNTS_ORGANIZATION : SUGGESTED_AMOUNTS_INDIVIDUAL,
    [isOrganization]
  );

  // Local state for input display (allows empty while typing)
  const [inputValue, setInputValue] = useState<string>(value.toString());

  // Sync inputValue when value changes externally (button clicks)
  useMemo(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow empty string while typing
    setInputValue(rawValue);

    if (rawValue === '') {
      return; // Don't update parent yet, wait for blur
    }

    // Only whole euros allowed (parseInt ignores decimals)
    const newValue = parseInt(rawValue, 10);

    if (!isNaN(newValue) && newValue >= MIN_DONATION_AMOUNT) {
      onChange(Math.min(newValue, MAX_DONATION_AMOUNT));
    }
  };

  const handleBlur = () => {
    // On blur, ensure valid value
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < MIN_DONATION_AMOUNT) {
      onChange(MIN_DONATION_AMOUNT);
      setInputValue(MIN_DONATION_AMOUNT.toString());
    }
  };

  return (
    <div className="amount-selector" role="group" aria-labelledby="amount-label">
      <p id="amount-label" className="font-semibold text-gray-800 mb-4">
        Je souhaite donner :
      </p>

      <div className="flex flex-wrap gap-2 mb-4" role="radiogroup" aria-label="Montants suggérés">
        {amounts.map((amount) => (
          <button
            key={amount}
            type="button"
            role="radio"
            aria-checked={value === amount}
            className={`amount-selector__btn px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
              value === amount
                ? 'border-donaction-primary bg-donaction-primary/10 text-donaction-primary-dark'
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            aria-label="Montant libre en euros"
            aria-describedby="amount-hint"
            className="w-28 text-center border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-donaction-primary focus:outline-none transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true">
            €
          </span>
        </div>
        <span id="amount-hint" className="sr-only">
          Entre {MIN_DONATION_AMOUNT} et {MAX_DONATION_AMOUNT} euros
        </span>
      </div>
    </div>
  );
}
