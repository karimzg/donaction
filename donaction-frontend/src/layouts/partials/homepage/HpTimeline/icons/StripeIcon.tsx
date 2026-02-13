interface IconProps {
  className?: string;
}

export default function StripeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="6"
        y="12"
        width="36"
        height="24"
        rx="4"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <rect
        x="6"
        y="12"
        width="36"
        height="24"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="6"
        y="18"
        width="36"
        height="6"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <circle cx="14" cy="30" r="3" fill="currentColor" fillOpacity="0.4" />
      <path
        d="M28 28h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28 32h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </svg>
  );
}
