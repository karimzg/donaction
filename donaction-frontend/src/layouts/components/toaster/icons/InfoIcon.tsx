import React from 'react';

interface InfoIconProps {
  className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M10 6v0.01M10 9v3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default InfoIcon;
