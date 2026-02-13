interface ChevronIconProps {
	className?: string;
}

export default function ChevronIcon({ className }: ChevronIconProps) {
	return (
		<svg
			className={className}
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<polyline points="6 8 10 12 14 8" />
		</svg>
	);
}
