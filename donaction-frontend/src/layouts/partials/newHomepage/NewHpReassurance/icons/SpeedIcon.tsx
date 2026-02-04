export default function SpeedIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stopwatch body */}
      <circle
        cx="24"
        cy="26"
        r="16"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Fill */}
      <circle
        cx="24"
        cy="26"
        r="15"
        fill="url(#speedGradient)"
        opacity="0.15"
      />
      {/* Top button */}
      <rect
        x="22"
        y="4"
        width="4"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Side button */}
      <path
        d="M36 14L38 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Clock face markers */}
      <path d="M24 14V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 36V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 26H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 26H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Clock hand pointing to ~5 minutes (1 o'clock position) */}
      <path
        d="M24 26L28 18"
        stroke="#73cfa8"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="clock-hand"
      />
      {/* Center dot */}
      <circle cx="24" cy="26" r="2" fill="#73cfa8" />
      {/* Lightning bolt accent */}
      <path
        d="M18 24L21 21L19 26L22 26L19 31"
        stroke="#73cfa8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="lightning"
      />

      <defs>
        <linearGradient id="speedGradient" x1="24" y1="10" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#73cfa8" />
          <stop offset="1" stopColor="#5bb892" />
        </linearGradient>
      </defs>
    </svg>
  );
}
