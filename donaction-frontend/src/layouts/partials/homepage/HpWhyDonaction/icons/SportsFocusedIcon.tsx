interface IconProps {
  className?: string;
}

export default function SportsFocusedIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 6l5.18 10.5L40 18.27l-8 7.8 1.89 11.01L24 32l-9.89 5.08L16 26.07l-8-7.8 10.82-1.77L24 6z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 6l5.18 10.5L40 18.27l-8 7.8 1.89 11.01L24 32l-9.89 5.08L16 26.07l-8-7.8 10.82-1.77L24 6z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <circle cx="24" cy="21" r="4" fill="currentColor" />
    </svg>
  );
}
