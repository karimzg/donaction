import { useId } from 'react';

export default function CerfaDocIcon({ className = '' }: { className?: string }) {
  const gradientId = useId();

  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Document background */}
      <path
        d="M12 6C12 4.89543 12.8954 4 14 4H28L38 14V42C38 43.1046 37.1046 44 36 44H14C12.8954 44 12 43.1046 12 42V6Z"
        fill={`url(#${gradientId})`}
        opacity="0.15"
      />
      {/* Document outline */}
      <path
        d="M12 6C12 4.89543 12.8954 4 14 4H28L38 14V42C38 43.1046 37.1046 44 36 44H14C12.8954 44 12 43.1046 12 42V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Folded corner */}
      <path
        d="M28 4V12C28 13.1046 28.8954 14 30 14H38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Text lines */}
      <path d="M17 22H33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 28H29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Official stamp/seal */}
      <circle
        cx="30"
        cy="36"
        r="6"
        stroke="#73cfa8"
        strokeWidth="2"
        fill="none"
        className="stamp"
      />
      <path
        d="M27.5 36L29.5 38L33 34"
        stroke="#73cfa8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stamp-check"
      />

      <defs>
        <linearGradient id={gradientId} x1="25" y1="4" x2="25" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#73cfa8" />
          <stop offset="1" stopColor="#5bb892" />
        </linearGradient>
      </defs>
    </svg>
  );
}
