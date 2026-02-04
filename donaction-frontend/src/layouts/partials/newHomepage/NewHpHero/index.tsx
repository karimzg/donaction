import Link from 'next/link';
import './index.scss';

export default function NewHpHero() {
	return (
		<section className="new-hp-hero w-full min-h-[80vh] relative flex items-center py-16 px-6 md:px-0">
			<div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full max-w-screen-xl mx-auto">
				{/* Text content - 60% */}
				<div className="lg:w-[60%] w-full flex flex-col gap-6">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
						Mobilisez votre communauté pour vos projets
					</h1>
					<p className="text-lg md:text-xl text-gray-700 max-w-xl">
						Créez des collectes de dons, fidélisez vos donateurs et développez votre association
						avec Donaction.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 mt-4">
						<Link href="/new-club" className="btn btn-primary text-center">
							Créer mon club
						</Link>
						<Link href="/projets" className="btn btn-outline-primary text-center">
							Voir les projets
						</Link>
					</div>
				</div>

				{/* Illustration - 40% */}
				<div className="lg:w-[40%] w-full flex items-center justify-center">
					<div className="w-full max-w-md aspect-square bg-secondary/20 rounded-3xl flex items-center justify-center">
						{/* Placeholder for illustration */}
						<span className="text-6xl">🎯</span>
					</div>
				</div>
			</div>

			{/* Scroll indicator */}
			<div
				className="new-hp-hero__scroll-indicator absolute bottom-8 left-1/2"
				role="img"
				aria-label="Défiler vers le bas"
			>
				<div className="scroll-indicator-arrow"></div>
			</div>
		</section>
	);
}
