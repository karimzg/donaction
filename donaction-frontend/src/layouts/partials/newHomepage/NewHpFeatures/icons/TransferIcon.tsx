interface IconProps {
  className?: string;
}

export default function TransferIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left bank/wallet */}
      <rect
        x="4"
        y="14"
        width="14"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect x="7" y="20" width="8" height="2" rx="1" fill="currentColor" fillOpacity="0.5" />
      <rect x="7" y="24" width="6" height="2" rx="1" fill="currentColor" fillOpacity="0.3" />

      {/* Right bank/wallet */}
      <rect
        x="30"
        y="14"
        width="14"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect x="33" y="20" width="8" height="2" rx="1" fill="currentColor" fillOpacity="0.5" />
      <rect x="33" y="24" width="6" height="2" rx="1" fill="currentColor" fillOpacity="0.3" />

      {/* Transfer arrows */}
      <path
        d="M20 20H28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M25 17L28 20L25 23"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M28 28H20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M23 25L20 28L23 31"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Euro symbol */}
      <circle cx="24" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
      <text x="24" y="11" fontSize="7" fill="currentColor" textAnchor="middle" fontWeight="bold">€</text>
    </svg>
  );
}
