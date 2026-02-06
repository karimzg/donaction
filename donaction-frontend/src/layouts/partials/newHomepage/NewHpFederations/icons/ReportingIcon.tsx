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
      {/* Dashboard frame */}
      <rect x="4" y="6" width="40" height="36" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <rect x="4" y="6" width="40" height="6" rx="3" fill="currentColor" fillOpacity="0.2" />

      {/* Header indicator */}
      <circle cx="9" cy="9" r="1.2" fill="currentColor" opacity="0.5" />
      <line x1="11" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.4" />

      {/* Bar chart */}
      <rect x="8" y="26" width="4" height="10" rx="0.5" fill="currentColor" fillOpacity="0.5" />
      <rect x="14" y="20" width="4" height="16" rx="0.5" fill="currentColor" fillOpacity="0.7" />
      <rect x="20" y="16" width="4" height="20" rx="0.5" fill="currentColor" fillOpacity="0.6" />

      {/* Line chart with data points */}
      <polyline points="28,24 32,18 36,22 40,14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <path d="M28,24 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M32,18 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M36,22 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M40,14 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0" fill="currentColor" opacity="0.7" />

      {/* Footer indicators */}
      <path d="M8,40 L16,40 M18,40 L26,40 M28,40 L40,40" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}
