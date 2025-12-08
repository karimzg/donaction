'use client';
import { useEffect } from 'react';

const UseSticky = () => {
	let previousScrollY: number = NaN;
	let timeoutId: NodeJS.Timeout;
	useEffect(() => {
		const header = document.querySelector('#HEADER_TAG') as HTMLHeadElement;
		const stickyHeader = () => {
			const scrollY = window.scrollY;
			if (!isNaN(previousScrollY)) {
				const shouldBeFixed = scrollY > 100 && scrollY < previousScrollY;
				const isAlreadyFixed = header?.classList?.contains('header-fixed-top');

				if (shouldBeFixed && !isAlreadyFixed) {
					header?.classList.add('header-fixed-top');
					// settxtColorUsed('#000000');
				} else if (!shouldBeFixed && isAlreadyFixed) {
					header?.classList.remove('header-fixed-top');
					// settxtColorUsed(txtColor);
				}
			}

			previousScrollY = scrollY;
		};

		const debounce = () => {
			clearTimeout(+timeoutId);
			timeoutId = setTimeout(() => {
				stickyHeader();
			}, 100);
		};

		window.addEventListener('scroll', debounce);

		return () => {
			window.removeEventListener('scroll', debounce);
			document.body.style.overflow = 'auto';
		};
	}, []);

	return <></>;
};

export default UseSticky;
