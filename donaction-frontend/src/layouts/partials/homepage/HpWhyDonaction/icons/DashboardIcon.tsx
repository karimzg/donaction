interface IconProps {
  className?: string;
}

export default function DashboardIcon({ className }: IconProps) {
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
        y="4"
        width="40"
        height="40"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect x="10" y="26" width="6" height="12" rx="1" fill="currentColor" fillOpacity="0.5" />
      <rect x="21" y="18" width="6" height="20" rx="1" fill="currentColor" fillOpacity="0.7" />
      <rect x="32" y="10" width="6" height="28" rx="1" fill="currentColor" />
      <line
        x1="10"
        y1="14"
        x2="38"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        opacity="0.3"
      />
    </svg>
  );
}
