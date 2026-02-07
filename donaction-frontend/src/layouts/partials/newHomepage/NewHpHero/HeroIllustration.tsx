/**
 * Donation-themed illustration for NewHpHero section
 * Shows hands holding heart with floating hearts and coins
 */
export default function HeroIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="w-full max-w-[420px] h-auto"
      viewBox="0 0 420 360"
    >
      {/* Background Circle */}
      <circle cx="210" cy="180" r="160" fill="#f8faf9" />
      <circle cx="210" cy="180" r="140" fill="#f0f7f4" />

      {/* Floating Hearts */}
      <g className="new-hp-hero__float-slow">
        <path
          d="M120 100 C120 85 135 75 150 85 C165 75 180 85 180 100 C180 120 150 145 150 145 C150 145 120 120 120 100Z"
          fill="#fb9289"
          opacity="0.8"
        />
      </g>
      <g className="new-hp-hero__float-medium">
        <path
          d="M300 80 C300 68 312 60 324 68 C336 60 348 68 348 80 C348 95 324 115 324 115 C324 115 300 95 300 80Z"
          fill="#73cfa8"
          opacity="0.6"
        />
      </g>
      <g className="new-hp-hero__float-fast">
        <path
          d="M80 200 C80 190 90 183 100 190 C110 183 120 190 120 200 C120 212 100 228 100 228 C100 228 80 212 80 200Z"
          fill="#fb9289"
          opacity="0.5"
        />
      </g>

      {/* Central Hands with Heart */}
      <g transform="translate(130, 120)">
        {/* Left Hand */}
        <path
          d="M40 100 C20 100 10 80 15 60 C20 40 35 35 50 40 L60 45 L60 120 C60 130 50 140 40 140 C30 140 20 130 20 120 L20 100 Z"
          fill="#fcd9b6"
          stroke="#e8c9a0"
          strokeWidth="2"
        />
        {/* Right Hand */}
        <path
          d="M120 100 C140 100 150 80 145 60 C140 40 125 35 110 40 L100 45 L100 120 C100 130 110 140 120 140 C130 140 140 130 140 120 L140 100 Z"
          fill="#fcd9b6"
          stroke="#e8c9a0"
          strokeWidth="2"
        />
        {/* Heart in Hands */}
        <path
          d="M80 50 C80 30 95 15 110 30 C125 15 140 30 140 50 C140 80 110 110 110 110 C110 110 80 80 80 50Z"
          fill="#fb9289"
          stroke="#e07a72"
          strokeWidth="2"
        />
        {/* Heart Shine */}
        <ellipse cx="95" cy="45" rx="8" ry="6" fill="white" opacity="0.4" />
      </g>

      {/* Floating Coins */}
      <g className="new-hp-hero__float-medium">
        <ellipse cx="320" cy="220" rx="25" ry="8" fill="#d4a853" />
        <ellipse cx="320" cy="215" rx="25" ry="8" fill="#f4c663" />
        <text
          x="320"
          y="219"
          textAnchor="middle"
          fontSize="12"
          fill="#b8923d"
          fontWeight="bold"
        >
          €
        </text>
      </g>
      <g className="new-hp-hero__float-slow">
        <ellipse cx="340" cy="250" rx="20" ry="6" fill="#d4a853" />
        <ellipse cx="340" cy="246" rx="20" ry="6" fill="#f4c663" />
        <text
          x="340"
          y="250"
          textAnchor="middle"
          fontSize="10"
          fill="#b8923d"
          fontWeight="bold"
        >
          €
        </text>
      </g>

      {/* Decorative Elements */}
      <circle cx="70" cy="280" r="6" fill="#73cfa8" opacity="0.4" />
      <circle cx="350" cy="140" r="8" fill="#73cfa8" opacity="0.3" />
      <circle cx="90" cy="140" r="4" fill="#fb9289" opacity="0.4" />

      {/* Sparkles */}
      <g fill="#73cfa8" opacity="0.6">
        <path d="M280 160 L283 167 L290 167 L284 172 L286 180 L280 175 L274 180 L276 172 L270 167 L277 167 Z" />
        <path d="M150 260 L152 265 L157 265 L153 268 L154 273 L150 270 L146 273 L147 268 L143 265 L148 265 Z" />
      </g>
    </svg>
  );
}
