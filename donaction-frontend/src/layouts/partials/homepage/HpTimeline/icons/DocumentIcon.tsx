interface IconProps {
  className?: string;
}

export default function DocumentIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 8h16l12 12v24a2 2 0 01-2 2H12a2 2 0 01-2-2V10a2 2 0 012-2z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M12 8h16l12 12v24a2 2 0 01-2 2H12a2 2 0 01-2-2V10a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M28 8v12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 26h16M16 32h12M16 38h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
    </svg>
  );
}
