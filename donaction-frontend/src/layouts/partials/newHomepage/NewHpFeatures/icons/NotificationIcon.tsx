interface IconProps {
  className?: string;
}

export default function NotificationIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bell body */}
      <path
        d="M24 4C16.268 4 10 10.268 10 18V26L6 32V34H42V32L38 26V18C38 10.268 31.732 4 24 4Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Bell clapper */}
      <path
        d="M20 34V36C20 38.209 21.791 40 24 40C26.209 40 28 38.209 28 36V34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Notification dot */}
      <circle cx="36" cy="12" r="6" fill="currentColor" />
      <circle cx="36" cy="12" r="3" fill="white" fillOpacity="0.5" />
    </svg>
  );
}
