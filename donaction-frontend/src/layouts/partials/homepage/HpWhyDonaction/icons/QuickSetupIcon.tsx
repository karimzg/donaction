interface IconProps {
  className?: string;
}

export default function QuickSetupIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M26 4L8 28h14l-2 16 18-24H24l2-16z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M26 4L8 28h14l-2 16 18-24H24l2-16z"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}
