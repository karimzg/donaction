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
      {/* Main buildings/clubs structure */}
      <g>
        {/* Left building */}
        <rect
          x="6"
          y="12"
          width="12"
          height="28"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.3"
        />
        {/* Center top building - taller */}
        <rect
          x="20"
          y="8"
          width="12"
          height="32"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.6"
        />
        {/* Right building */}
        <rect
          x="34"
          y="15"
          width="12"
          height="25"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.3"
        />

        {/* Windows on left building */}
        <circle cx="9" cy="18" r="1.2" fill="currentColor" fillOpacity="0.5" />
        <circle cx="15" cy="18" r="1.2" fill="currentColor" fillOpacity="0.5" />
        <circle cx="9" cy="26" r="1.2" fill="currentColor" fillOpacity="0.5" />
        <circle cx="15" cy="26" r="1.2" fill="currentColor" fillOpacity="0.5" />
        <circle cx="9" cy="34" r="1.2" fill="currentColor" fillOpacity="0.5" />
        <circle cx="15" cy="34" r="1.2" fill="currentColor" fillOpacity="0.5" />

        {/* Windows on center building */}
        <circle cx="23" cy="15" r="1.2" fill="currentColor" fillOpacity="0.7" />
        <circle cx="29" cy="15" r="1.2" fill="currentColor" fillOpacity="0.7" />
        <circle cx="23" cy="23" r="1.2" fill="currentColor" fillOpacity="0.7" />
        <circle cx="29" cy="23" r="1.2" fill="currentColor" fillOpacity="0.7" />
        <circle cx="23" cy="31" r="1.2" fill="currentColor" fillOpacity="0.7" />
        <circle cx="29" cy="31" r="1.2" fill="currentColor" fillOpacity="0.7" />

        {/* Windows on right building */}
        <circle cx="37" cy="21" r="1.2" fill="currentColor" fillOpacity="0.5" />
        <circle cx="43" cy="21" r="1.2" fill="currentColor" fillOpacity="0.5" />
        <circle cx="37" cy="29" r="1.2" fill="currentColor" fillOpacity="0.5" />
        <circle cx="43" cy="29" r="1.2" fill="currentColor" fillOpacity="0.5" />

        {/* Connection line at bottom representing unity */}
        <line
          x1="6"
          y1="41"
          x2="46"
          y2="41"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}
