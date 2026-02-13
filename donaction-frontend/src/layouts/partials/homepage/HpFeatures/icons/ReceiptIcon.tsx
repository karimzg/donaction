interface IconProps {
  className?: string;
}

export default function ReceiptIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Document */}
      <path
        d="M10 6C10 4.895 10.895 4 12 4H28L38 14V42C38 43.105 37.105 44 36 44H12C10.895 44 10 43.105 10 42V6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Folded corner */}
      <path
        d="M28 4V12C28 13.105 28.895 14 30 14H38"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Checkmark */}
      <path
        d="M17 28L22 33L32 23"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Text lines */}
      <rect x="15" y="18" width="10" height="2" rx="1" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}
