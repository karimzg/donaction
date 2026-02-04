import { useId } from 'react';

export default function ShieldLockIcon({ className = '' }: { className?: string }) {
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
      {/* Shield shape */}
      <path
        d="M24 4L6 12V22C6 33.1 13.68 43.32 24 46C34.32 43.32 42 33.1 42 22V12L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="shield-outline"
      />
      {/* Shield fill gradient */}
      <path
        d="M24 6L8 13V22C8 32.02 14.94 41.22 24 43.82C33.06 41.22 40 32.02 40 22V13L24 6Z"
        fill={`url(#${gradientId})`}
        opacity="0.15"
      />
      {/* Lock body */}
      <rect
        x="18"
        y="22"
        width="12"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Lock shackle */}
      <path
        d="M21 22V18C21 16.3431 22.3431 15 24 15C25.6569 15 27 16.3431 27 18V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Lock keyhole */}
      <circle cx="24" cy="26" r="1.5" fill="currentColor" />
      <path d="M24 27.5V29.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      <defs>
        <linearGradient id={gradientId} x1="24" y1="6" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#73cfa8" />
          <stop offset="1" stopColor="#5bb892" />
        </linearGradient>
      </defs>
    </svg>
  );
}
