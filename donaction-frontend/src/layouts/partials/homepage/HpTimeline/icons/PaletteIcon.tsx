interface IconProps {
  className?: string;
}

export default function PaletteIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20c2.21 0 4-1.79 4-4 0-1.04-.39-1.99-1.03-2.71-.62-.7-.97-1.62-.97-2.62 0-2.21 1.79-4 4-4h4.68c6.08 0 11.32-5.24 11.32-11.32C44 12.28 35.26 4 24 4z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20c2.21 0 4-1.79 4-4 0-1.04-.39-1.99-1.03-2.71-.62-.7-.97-1.62-.97-2.62 0-2.21 1.79-4 4-4h4.68c6.08 0 11.32-5.24 11.32-11.32C44 12.28 35.26 4 24 4z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="14" cy="20" r="3" fill="#FB9289" />
      <circle cx="22" cy="12" r="3" fill="#73CFA8" />
      <circle cx="32" cy="16" r="3" fill="#5BB892" />
      <circle cx="36" cy="26" r="3" fill="#FFD93D" />
    </svg>
  );
}
