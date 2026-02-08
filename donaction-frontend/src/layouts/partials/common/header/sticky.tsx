'use client';
import { useEffect } from 'react';

const UseSticky = () => {
	useEffect(() => {
		let previousScrollY: number = NaN;
		const header = document.querySelector('#HEADER_TAG') as HTMLHeadElement;

		const stickyHeader = () => {
			const scrollY = window.scrollY;
			if (!isNaN(previousScrollY)) {
				const shouldBeFixed = scrollY > 80 && scrollY < previousScrollY;
				const isAlreadyFixed = header?.classList?.contains('header--sticky');

				if (shouldBeFixed && !isAlreadyFixed) {
					header?.classList.add('header--sticky');
				} else if (!shouldBeFixed && isAlreadyFixed) {
					header?.classList.remove('header--sticky');
				}
			}

			previousScrollY = scrollY;
		};

		let ticking = false;
		const onScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					stickyHeader();
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
			document.body.style.overflow = 'auto';
		};
	}, []);

	return <></>;
};

export default UseSticky;
