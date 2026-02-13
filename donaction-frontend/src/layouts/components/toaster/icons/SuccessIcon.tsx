import React from 'react';

interface SuccessIconProps {
  className?: string;
}

const SuccessIcon: React.FC<SuccessIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M6.5 10l2.5 2.5 4-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SuccessIcon;
