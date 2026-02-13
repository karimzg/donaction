interface IconProps {
  className?: string;
}

export default function UserIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="16" r="8" fill="currentColor" fillOpacity="0.2" />
      <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  );
}
