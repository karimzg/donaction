interface IconProps {
  className?: string;
}

export default function MultiClubIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Three buildings representing multi-club federation */}
      <rect x="6" y="12" width="12" height="28" rx="1.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
      <rect x="20" y="8" width="12" height="32" rx="1.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.6" />
      <rect x="34" y="15" width="12" height="25" rx="1.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />

      {/* Windows as consolidated path per building */}
      <path d="M9,18 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M15,18 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M9,26 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M15,26 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M9,34 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M15,34 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0" fill="currentColor" fillOpacity="0.5" />
      <path d="M23,15 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M29,15 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M23,23 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M29,23 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M23,31 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M29,31 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0" fill="currentColor" fillOpacity="0.7" />
      <path d="M37,21 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M43,21 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M37,29 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0 M43,29 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0" fill="currentColor" fillOpacity="0.5" />

      {/* Unity line */}
      <line x1="6" y1="41" x2="46" y2="41" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}
