interface IconProps {
  className?: string;
}

export default function WidgetIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Code brackets */}
      <path
        d="M14 12L4 24L14 36"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 12L44 24L34 36"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center widget box */}
      <rect
        x="18"
        y="18"
        width="12"
        height="12"
        rx="2"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Inner dot */}
      <circle cx="24" cy="24" r="2" fill="currentColor" />
    </svg>
  );
}
