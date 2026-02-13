interface IconProps {
  className?: string;
}

export default function NoSubscriptionIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="12"
        width="40"
        height="28"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <line
        x1="4"
        y1="20"
        x2="44"
        y2="20"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle cx="36" cy="32" r="3" fill="currentColor" />
      <circle cx="28" cy="32" r="3" fill="currentColor" opacity="0.5" />
      <line
        x1="6"
        y1="42"
        x2="42"
        y2="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
