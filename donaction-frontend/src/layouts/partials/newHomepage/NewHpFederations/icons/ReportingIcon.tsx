interface IconProps {
  className?: string;
}

export default function ReportingIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Dashboard/Chart background */}
      <rect
        x="4"
        y="6"
        width="40"
        height="36"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />

      {/* Top header bar */}
      <rect x="4" y="6" width="40" height="6" rx="3" fill="currentColor" fillOpacity="0.2" />

      {/* Grid title icon */}
      <circle cx="9" cy="9" r="1.2" fill="currentColor" opacity="0.5" />
      <line x1="11" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.4" />

      {/* Bar chart left side */}
      <rect x="8" y="26" width="4" height="10" rx="0.5" fill="currentColor" fillOpacity="0.5" />
      <rect x="14" y="20" width="4" height="16" rx="0.5" fill="currentColor" fillOpacity="0.7" />
      <rect x="20" y="16" width="4" height="20" rx="0.5" fill="currentColor" fillOpacity="0.6" />

      {/* Line chart right side */}
      <polyline
        points="28,24 32,18 36,22 40,14"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />

      {/* Data points on line */}
      <circle cx="28" cy="24" r="1.2" fill="currentColor" opacity="0.7" />
      <circle cx="32" cy="18" r="1.2" fill="currentColor" opacity="0.7" />
      <circle cx="36" cy="22" r="1.2" fill="currentColor" opacity="0.7" />
      <circle cx="40" cy="14" r="1.2" fill="currentColor" opacity="0.7" />

      {/* Bottom info text indicators */}
      <line x1="8" y1="40" x2="16" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <line x1="18" y1="40" x2="26" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <line x1="28" y1="40" x2="40" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}
