import React from 'react';

interface ErrorIconProps {
  className?: string;
}

const ErrorIcon: React.FC<ErrorIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M7 7l6 6M13 7l-6 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ErrorIcon;
