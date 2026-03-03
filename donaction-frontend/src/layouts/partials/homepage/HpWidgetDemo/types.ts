export interface TaxCalculationResult {
  originalAmount: number;
  taxReduction: number;
  costAfterTax: number;
  taxRate: number;
  donorType: 'particulier' | 'entreprise';
}

export interface AmountSelectorProps {
  value: number;
  onChange: (amount: number) => void;
  isOrganization: boolean;
}

export interface TaxCalculationDisplayProps {
  result: TaxCalculationResult;
}

export interface DemoBlockerProps {
  onClose: () => void;
}

export interface DonorTypeToggleProps {
  isOrganization: boolean;
  onChange: (isOrganization: boolean) => void;
}
