interface IconProps {
  className?: string;
}

export default function DedicatedSupportIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Headset ear cups */}
      <circle cx="12" cy="16" r="4.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
      <circle cx="36" cy="16" r="4.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />

      {/* Headband */}
      <path d="M 12 11.5 Q 24 6 36 11.5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Microphone boom + head */}
      <line x1="10" y1="18" x2="6" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="6" cy="32" r="2.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />

      {/* Sound waves */}
      <path d="M 30 28 Q 32 26 34 28 M 28 31 Q 31 27 36 31 M 27 34 Q 31 28 38 34" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />

      {/* Inner ear cup detail */}
      <path d="M12,13 L12,19 M36,13 L36,19" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}
