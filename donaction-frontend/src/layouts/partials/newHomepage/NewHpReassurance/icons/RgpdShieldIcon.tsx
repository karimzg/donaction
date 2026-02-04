export default function RgpdShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield shape */}
      <path
        d="M24 4L6 12V22C6 33.1 13.68 43.32 24 46C34.32 43.32 42 33.1 42 22V12L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Shield fill */}
      <path
        d="M24 6L8 13V22C8 32.02 14.94 41.22 24 43.82C33.06 41.22 40 32.02 40 22V13L24 6Z"
        fill="url(#rgpdGradient)"
        opacity="0.15"
      />
      {/* EU-inspired star circle */}
      <circle
        cx="24"
        cy="24"
        r="10"
        stroke="#73cfa8"
        strokeWidth="1.5"
        fill="none"
        className="eu-circle"
      />
      {/* Stars arrangement (simplified EU flag motif) */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 24 + 7 * Math.cos(rad - Math.PI / 2);
        const y = 24 + 7 * Math.sin(rad - Math.PI / 2);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="1.5"
            fill="#73cfa8"
            className="eu-star"
          />
        );
      })}
      {/* Center privacy icon (user silhouette) */}
      <circle cx="24" cy="22" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M19 30C19 27.2386 21.2386 25 24 25C26.7614 25 29 27.2386 29 30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      <defs>
        <linearGradient id="rgpdGradient" x1="24" y1="6" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#73cfa8" />
          <stop offset="1" stopColor="#5bb892" />
        </linearGradient>
      </defs>
    </svg>
  );
}
