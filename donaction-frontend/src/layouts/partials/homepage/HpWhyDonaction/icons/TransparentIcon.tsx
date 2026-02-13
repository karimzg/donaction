interface IconProps {
  className?: string;
}

export default function TransparentIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="4" fill="currentColor" />
      <path
        d="M24 6C14.059 6 5.607 12.337 3 21c2.607 8.663 11.059 15 21 15s18.393-6.337 21-15C42.393 12.337 33.941 6 24 6z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
