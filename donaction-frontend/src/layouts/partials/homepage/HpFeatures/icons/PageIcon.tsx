interface IconProps {
  className?: string;
}

export default function PageIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Browser frame */}
      <rect
        x="4"
        y="6"
        width="40"
        height="36"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* Top bar */}
      <line
        x1="4"
        y1="14"
        x2="44"
        y2="14"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Browser dots */}
      <circle cx="10" cy="10" r="1.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="20" cy="10" r="1.5" fill="currentColor" fillOpacity="0.5" />
      {/* Content lines */}
      <rect x="10" y="20" width="28" height="3" rx="1" fill="currentColor" fillOpacity="0.7" />
      <rect x="10" y="26" width="20" height="3" rx="1" fill="currentColor" fillOpacity="0.5" />
      <rect x="10" y="32" width="24" height="3" rx="1" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}
