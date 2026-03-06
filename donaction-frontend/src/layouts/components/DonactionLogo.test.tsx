import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DonactionLogo from './DonactionLogo';

// Mock next/image
vi.mock('next/image', () => ({
	default: (props: any) => <img {...props} />,
}));

describe('DonactionLogo', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders an image element with alt text', () => {
		render(<DonactionLogo />);
		const img = screen.getByAltText('Donaction');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', '/images/donaction-logo-animated.svg');
	});

	it('uses default dimensions when not provided', () => {
		render(<DonactionLogo />);
		const img = screen.getByAltText('Donaction') as HTMLImageElement;
		expect(img.width).toBe(160);
		expect(img.height).toBe(40);
	});

	it('applies custom className', () => {
		render(<DonactionLogo className='custom-class' />);
		const img = screen.getByAltText('Donaction');
		expect(img.className).toContain('custom-class');
	});

	describe('header context', () => {
		it('sets priority to true when context is header', () => {
			const { container } = render(<DonactionLogo context='header' />);
			// Priority is a prop on the Image component, not visible in DOM
			const img = screen.getByAltText('Donaction');
			expect(img).toBeInTheDocument();
		});

		it('applies header height style', () => {
			render(<DonactionLogo context='header' />);
			const img = screen.getByAltText('Donaction') as HTMLImageElement;
			const style = img.getAttribute('style');
			expect(style).toContain('height: 32px');
		});

		it('does not apply brightness-0 invert classes for header', () => {
			render(<DonactionLogo context='header' />);
			const img = screen.getByAltText('Donaction');
			expect(img.className).not.toContain('brightness-0');
			expect(img.className).not.toContain('invert');
		});
	});

	describe('footer context', () => {
		it('applies footer height style', () => {
			render(<DonactionLogo context='footer' />);
			const img = screen.getByAltText('Donaction') as HTMLImageElement;
			const style = img.getAttribute('style');
			expect(style).toContain('height: 28px');
		});

		it('applies brightness-0 invert classes for footer', () => {
			render(<DonactionLogo context='footer' />);
			const img = screen.getByAltText('Donaction');
			expect(img.className).toContain('brightness-0');
			expect(img.className).toContain('invert');
		});
	});

	it('respects custom width and height props', () => {
		render(<DonactionLogo width={200} height={50} />);
		const img = screen.getByAltText('Donaction') as HTMLImageElement;
		expect(img.width).toBe(200);
		expect(img.height).toBe(50);
	});

	it('applies maxWidth style based on width prop', () => {
		render(<DonactionLogo width={180} />);
		const img = screen.getByAltText('Donaction') as HTMLImageElement;
		const style = img.getAttribute('style');
		expect(style).toContain('max-width: 180px');
	});

	it('applies objectFit contain style', () => {
		render(<DonactionLogo />);
		const img = screen.getByAltText('Donaction') as HTMLImageElement;
		const style = img.getAttribute('style');
		expect(style).toContain('object-fit: contain');
	});

	it('sets width to auto in style', () => {
		render(<DonactionLogo />);
		const img = screen.getByAltText('Donaction') as HTMLImageElement;
		const style = img.getAttribute('style');
		expect(style).toContain('width: auto');
	});
});
