interface IconProps {
  className?: string;
}

export default function PoolIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Piggy bank body */}
      <ellipse
        cx="24"
        cy="28"
        rx="16"
        ry="12"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* Ears */}
      <path
        d="M14 18C14 14 17 12 20 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M34 18C34 14 31 12 28 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Slot */}
      <rect x="20" y="16" width="8" height="3" rx="1.5" fill="currentColor" />
      {/* Snout */}
      <ellipse cx="40" cy="28" rx="4" ry="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="39" cy="27" r="1" fill="currentColor" />
      <circle cx="41" cy="27" r="1" fill="currentColor" />
      {/* Legs */}
      <rect x="12" y="36" width="4" height="6" rx="2" fill="currentColor" fillOpacity="0.7" />
      <rect x="32" y="36" width="4" height="6" rx="2" fill="currentColor" fillOpacity="0.7" />
      {/* Coin */}
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
      <text x="10" y="13" fontSize="8" fill="currentColor" textAnchor="middle" fontWeight="bold">€</text>
    </svg>
  );
}
