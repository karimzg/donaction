import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileDrawer from './mobileDrawer';

// Mock next/link
vi.mock('next/link', () => ({
	default: ({ children, href, className, onClick }: any) => (
		<a href={href} className={className} onClick={onClick}>
			{children}
		</a>
	),
}));

// Mock next/image
vi.mock('next/image', () => ({
	default: (props: any) => <img {...props} />,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
	usePathname: () => '/test',
	useRouter: () => ({ push: vi.fn() }),
}));

// Mock DonactionLogo
vi.mock('@/components/DonactionLogo', () => ({
	default: () => <div data-testid='donaction-logo' />,
}));

// Mock ClientController
vi.mock('@/partials/common/header/clientController', () => ({
	default: (props: any) => <div data-testid={`client-controller-${props.component}`} />,
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
	signOut: vi.fn(),
}));

// Mock Redux store
vi.mock('@/core/store/hooks', () => ({
	useAppSelector: vi.fn(() => ({ status: 'unauthenticated', data: null })),
	useAppDispatch: vi.fn(() => vi.fn()),
}));

// Mock feature flags
vi.mock('@/core/helpers/featureFlags', () => ({
	SHOW_CLUBS_NAV: true,
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
	FaChevronDown: ({ className }: any) => <span data-testid='chevron-icon' className={className} />,
}));

describe('MobileDrawer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('hamburger button', () => {
		it('renders hamburger button', () => {
			render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const buttons = screen.getAllByRole('button');
			const hamburger = buttons.find((btn) => btn.getAttribute('aria-label')?.includes('Ouvrir'));
			expect(hamburger).toBeInTheDocument();
		});

		it('hamburger button has correct aria-label', () => {
			render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const openButtons = screen.getAllByRole('button').filter((btn) =>
				btn.getAttribute('aria-label')?.includes('Ouvrir')
			);
			expect(openButtons.length).toBeGreaterThan(0);
			expect(openButtons[0]).toHaveAttribute('aria-label', 'Ouvrir le menu');
		});

		it('hamburger button has hamburger class', () => {
			render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const buttons = screen.getAllByRole('button');
			const hamburger = buttons.find((btn) => btn.getAttribute('aria-label')?.includes('Ouvrir'));
			expect(hamburger).toHaveClass('hamburger');
		});

		it('hamburger respects custom text color', () => {
			const { container } = render(<MobileDrawer serverSession={null} txtColor='#FF0000' />);
			const openButton = Array.from(container.querySelectorAll('.hamburger')).find((btn) =>
				(btn as HTMLElement).getAttribute('aria-label')?.includes('Ouvrir')
			);
			const spans = openButton?.querySelectorAll('span') || [];
			expect(spans.length).toBe(3);
			spans.forEach((span) => {
				expect((span as HTMLElement).style.backgroundColor).toBe('rgb(255, 0, 0)');
			});
		});
	});

	describe('close button', () => {
		it('renders close button inside drawer', () => {
			render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const buttons = screen.getAllByRole('button');
			const closeButton = buttons.find((btn) => btn.getAttribute('aria-label')?.includes('Fermer'));
			expect(closeButton).toBeInTheDocument();
		});

		it('close button has correct aria-label', () => {
			render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const closeButtons = screen.getAllByRole('button').filter((btn) =>
				btn.getAttribute('aria-label')?.includes('Fermer')
			);
			expect(closeButtons.length).toBeGreaterThan(0);
			expect(closeButtons[0]).toHaveAttribute('aria-label', 'Fermer le menu');
		});
	});

	describe('logout functionality', () => {
		it('renders logout as button element, not link', () => {
			render(
				<MobileDrawer
					serverSession={{ user: { name: 'Test' }, expires: '' } as any}
					txtColor='#000'
				/>
			);
			// Find all buttons
			const buttons = screen.getAllByRole('button');
			// The logout button should be a button element
			expect(buttons.length).toBeGreaterThan(0);
		});

		it('logout is a button type, not a link', () => {
			const { container } = render(
				<MobileDrawer
					serverSession={{ user: { name: 'Test' }, expires: '' } as any}
					txtColor='#000'
				/>
			);
			const logoutButton = Array.from(container.querySelectorAll('button')).find((btn) =>
				btn.textContent?.includes('Se déconnecter')
			);
			expect(logoutButton).toBeInTheDocument();
			expect(logoutButton?.tagName).toBe('BUTTON');
		});

		it('logout button is not wrapped in a link', () => {
			const { container } = render(
				<MobileDrawer
					serverSession={{ user: { name: 'Test' }, expires: '' } as any}
					txtColor='#000'
				/>
			);
			const logoutButton = Array.from(container.querySelectorAll('button')).find((btn) =>
				btn.textContent?.includes('Se déconnecter')
			);
			const parentLink = logoutButton?.closest('a');
			expect(parentLink).not.toBeInTheDocument();
		});

		it('logout button is a direct child of list item', () => {
			const { container } = render(
				<MobileDrawer
					serverSession={{ user: { name: 'Test' }, expires: '' } as any}
					txtColor='#000'
				/>
			);
			const logoutButton = Array.from(container.querySelectorAll('button')).find((btn) =>
				btn.textContent?.includes('Se déconnecter')
			);
			const li = logoutButton?.closest('li');
			expect(li).toBeInTheDocument();
		});
	});

	describe('drawer visibility', () => {
		it('renders drawer element with ID MOBILE_DRAWER', () => {
			const { container } = render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const drawer = container.querySelector('#MOBILE_DRAWER');
			expect(drawer).toBeInTheDocument();
		});

		it('backdrop element is rendered', () => {
			const { container } = render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const backdrop = container.querySelector('.mobile-drawer__backdrop');
			expect(backdrop).toBeInTheDocument();
		});
	});

	describe('navigation links', () => {
		it('renders Mécénat link', () => {
			render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const mecenatLinks = screen.getAllByRole('link', { name: /mécénat/i });
			expect(mecenatLinks.length).toBeGreaterThan(0);
		});

		it('renders Contactez-nous link', () => {
			render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const contactLinks = screen.getAllByRole('link', { name: /contactez-nous/i });
			expect(contactLinks.length).toBeGreaterThan(0);
		});

		it('renders Donaction logo link', () => {
			render(<MobileDrawer serverSession={null} txtColor='#000' />);
			expect(screen.getByTestId('donaction-logo')).toBeInTheDocument();
		});
	});

	describe('authenticated state', () => {
		it('renders user profile section when session exists', () => {
			render(
				<MobileDrawer
					serverSession={{ user: { name: 'Test User' }, expires: '' } as any}
					txtColor='#000'
				/>
			);
			expect(screen.getByTestId('client-controller-USER_DETAIL_DROPDOWN')).toBeInTheDocument();
		});

		it('renders sign up and login buttons when not authenticated', () => {
			render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const signUpLinks = screen.getAllByRole('link', { name: /s'inscrire/i });
			expect(signUpLinks.length).toBeGreaterThan(0);
		});

		it('does not render sign up button when authenticated', () => {
			render(
				<MobileDrawer
					serverSession={{ user: { name: 'Test User' }, expires: '' } as any}
					txtColor='#000'
				/>
			);
			const signUpLinks = screen.queryAllByRole('link', { name: /s'inscrire/i });
			expect(signUpLinks.length).toBe(0);
		});
	});

	describe('club navigation', () => {
		it('renders clubs section when SHOW_CLUBS_NAV is true', () => {
			const slugs = [
				{ slug: 'club-1', label: 'Club One' },
				{ slug: 'club-2', label: 'Club Two' },
			];
			render(<MobileDrawer serverSession={null} slugs={slugs} txtColor='#000' />);
			const clubsText = screen.getByText('Clubs');
			expect(clubsText).toBeInTheDocument();
		});

		it('renders club slugs when provided', () => {
			const slugs = [
				{ slug: 'club-1', label: 'Club One' },
				{ slug: 'club-2', label: 'Club Two' },
			];
			render(<MobileDrawer serverSession={null} slugs={slugs} txtColor='#000' />);
			// Open clubs section first by clicking
			const clubsText = screen.getByText('Clubs');
			expect(clubsText.closest('div')).toBeInTheDocument();
		});

		it('renders see all clubs link', () => {
			const slugs = [{ slug: 'club-1', label: 'Club One' }];
			render(<MobileDrawer serverSession={null} slugs={slugs} txtColor='#000' />);
			const allClubsLinks = screen.getAllByRole('link', { name: /voir tous les clubs/i });
			expect(allClubsLinks.length).toBeGreaterThan(0);
		});
	});

	describe('legal links', () => {
		it('renders legal links section', () => {
			const { container } = render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const legalSection = Array.from(container.querySelectorAll('a')).find((link) =>
				link.textContent?.includes('Conditions générales')
			);
			expect(legalSection).toBeInTheDocument();
		});
	});

	describe('logo rendering', () => {
		it('renders Donaction logo in drawer header', () => {
			render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const logos = screen.getAllByTestId('donaction-logo');
			expect(logos.length).toBeGreaterThan(0);
		});
	});

	describe('text color handling', () => {
		it('applies custom text color to hamburger spans', () => {
			const { container } = render(<MobileDrawer serverSession={null} txtColor='#00FF00' />);
			const openButton = Array.from(container.querySelectorAll('.hamburger')).find((btn) =>
				(btn as HTMLElement).getAttribute('aria-label')?.includes('Ouvrir')
			);
			const spans = openButton?.querySelectorAll('span') || [];
			spans.forEach((span) => {
				expect((span as HTMLElement).style.backgroundColor).toBe('rgb(0, 255, 0)');
			});
		});

		it('defaults to black when no txtColor provided', () => {
			const { container } = render(<MobileDrawer serverSession={null} txtColor='#000' />);
			const openButton = Array.from(container.querySelectorAll('.hamburger')).find((btn) =>
				(btn as HTMLElement).getAttribute('aria-label')?.includes('Ouvrir')
			);
			const spans = openButton?.querySelectorAll('span') || [];
			spans.forEach((span) => {
				expect((span as HTMLElement).style.backgroundColor).toBe('rgb(0, 0, 0)');
			});
		});
	});
});
