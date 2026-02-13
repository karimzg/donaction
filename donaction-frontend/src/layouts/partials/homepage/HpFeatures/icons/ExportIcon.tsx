interface IconProps {
  className?: string;
}

export default function ExportIcon({ className }: IconProps) {
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
        d="M8 8C8 5.791 9.791 4 12 4H28L40 16V40C40 42.209 38.209 44 36 44H12C9.791 44 8 42.209 8 40V8Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Folded corner */}
      <path
        d="M28 4V14C28 15.105 28.895 16 30 16H40"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Download arrow */}
      <path
        d="M24 22V36"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18 30L24 36L30 30"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Table lines */}
      <rect x="14" y="24" width="4" height="2" rx="0.5" fill="currentColor" fillOpacity="0.4" />
      <rect x="30" y="24" width="4" height="2" rx="0.5" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}
