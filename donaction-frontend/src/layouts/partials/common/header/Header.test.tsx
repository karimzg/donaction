import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from './index';

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

// Mock DonactionLogo
vi.mock('@/components/DonactionLogo', () => ({
	default: (props: any) => (
		<div data-testid='donaction-logo'>
			<img alt='Donaction' {...props} />
		</div>
	),
}));

// Mock child components
vi.mock('@/partials/common/header/clientController', () => ({
	default: (props: any) => <div data-testid={`client-controller-${props.component}`} />,
}));

vi.mock('@/partials/common/header/mobileDrawer', () => ({
	default: () => <div data-testid='mobile-drawer' />,
}));

vi.mock('@/partials/common/previewMode', () => ({
	default: () => null,
}));

vi.mock('@/partials/common/header/sticky', () => ({
	default: () => null,
}));

// Mock components
vi.mock('@/components/dropdownList', () => ({
	default: (props: any) => (
		<div data-testid='dropdown-list'>
			{props.toggler}
			{props.children}
		</div>
	),
}));

// Mock feature flags
vi.mock('@/core/helpers/featureFlags', () => ({
	SHOW_CLUBS_NAV: true,
}));

// Mock react-icons
vi.mock('react-icons/vsc', () => ({
	VscChevronDown: () => <span data-testid='chevron-icon' />,
}));

describe('Header', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('base rendering', () => {
		it('renders header element with correct id', () => {
			render(<Header session={null} />);
			const header = screen.getByRole('navigation').closest('header');
			expect(header).toHaveAttribute('id', 'HEADER_TAG');
		});

		it('renders Donaction logo link to home', () => {
			render(<Header session={null} />);
			const logoLink = screen.getByTestId('donaction-logo').closest('a');
			expect(logoLink).toHaveAttribute('href', '/');
		});

		it('renders logo within navigation', () => {
			render(<Header session={null} />);
			expect(screen.getByTestId('donaction-logo')).toBeInTheDocument();
		});
	});

	describe('navigation links', () => {
		it('renders Le mécénat link', () => {
			render(<Header session={null} />);
			const link = screen.getByRole('link', { name: /mécénat/i });
			expect(link).toHaveAttribute('href', '/mecenat');
		});

		it('renders Contact link', () => {
			render(<Header session={null} />);
			const links = screen.getAllByRole('link', { name: /contact/i });
			expect(links.length).toBeGreaterThan(0);
		});

		it('renders mobile drawer component', () => {
			render(<Header session={null} />);
			expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument();
		});
	});

	describe('club colors context', () => {
		it('applies club-specific class when clubColors provided', () => {
			const clubColors = {
				primary: '#FF0000',
				secondary: '#00FF00',
				headerText: '#0000FF',
			};
			const { container } = render(<Header session={null} clubColors={clubColors} />);
			const header = container.querySelector('header');
			expect(header).toHaveClass('header--club');
		});

		it('sets CSS variables for club colors', () => {
			const clubColors = {
				primary: '#FF0000',
				secondary: '#00FF00',
				headerText: '#0000FF',
			};
			const { container } = render(<Header session={null} clubColors={clubColors} />);
			const header = container.querySelector('header') as HTMLElement;
			expect(header.style.getPropertyValue('--club-primary')).toBe('#FF0000');
			expect(header.style.getPropertyValue('--club-secondary')).toBe('#00FF00');
		});

		it('renders accent bar when clubColors provided', () => {
			const clubColors = {
				primary: '#FF0000',
				secondary: '#00FF00',
				headerText: '#0000FF',
			};
			const { container } = render(<Header session={null} clubColors={clubColors} />);
			const accentBar = container.querySelector('.header__accent-bar');
			expect(accentBar).toBeInTheDocument();
		});

		it('does not render accent bar without clubColors', () => {
			const { container } = render(<Header session={null} />);
			const accentBar = container.querySelector('.header__accent-bar');
			expect(accentBar).not.toBeInTheDocument();
		});

		it('does not apply club class without clubColors', () => {
			const { container } = render(<Header session={null} />);
			const header = container.querySelector('header');
			expect(header).not.toHaveClass('header--club');
		});
	});

	describe('authentication states', () => {
		it('renders disconnected buttons when session is null', () => {
			render(<Header session={null} />);
			expect(screen.getByTestId('client-controller-DESK_DISCONNECTED_BTNS')).toBeInTheDocument();
		});

		it('renders connected buttons when session exists', () => {
			const session = {
				user: { name: 'Test User', email: 'test@example.com' },
				expires: new Date().toISOString(),
			} as any;
			render(<Header session={session} />);
			expect(screen.getByTestId('client-controller-DESK_CONNECTED_BTNS')).toBeInTheDocument();
		});

		it('renders dashboard button when session exists', () => {
			const session = {
				user: { name: 'Test User', email: 'test@example.com' },
				expires: new Date().toISOString(),
			} as any;
			render(<Header session={session} />);
			expect(screen.getByTestId('client-controller-HEADER_DASHBOARD_BTN')).toBeInTheDocument();
		});

		it('does not render dashboard button when session is null', () => {
			render(<Header session={null} />);
			expect(screen.queryByTestId('client-controller-HEADER_DASHBOARD_BTN')).not.toBeInTheDocument();
		});
	});

	describe('club navigation', () => {
		it('renders clubs dropdown when SHOW_CLUBS_NAV is true and slugs provided', () => {
			const slugs = [
				{ slug: 'club-1', label: 'Club One' },
				{ slug: 'club-2', label: 'Club Two' },
			];
			render(<Header session={null} slugs={slugs} />);
			expect(screen.getByTestId('dropdown-list')).toBeInTheDocument();
		});

		it('does not render dropdown when slugs array is empty', () => {
			render(<Header session={null} slugs={[]} />);
			expect(screen.queryByTestId('dropdown-list')).not.toBeInTheDocument();
		});

		it('does not render dropdown when slugs is undefined', () => {
			render(<Header session={null} />);
			expect(screen.queryByTestId('dropdown-list')).not.toBeInTheDocument();
		});
	});

	describe('responsive behavior', () => {
		it('renders header with z-50 utility', () => {
			const { container } = render(<Header session={null} />);
			const header = container.querySelector('header');
			expect(header).toHaveClass('z-50');
		});

		it('renders navigation with full width', () => {
			const { container } = render(<Header session={null} />);
			const header = container.querySelector('header');
			expect(header).toHaveClass('w-full');
		});

		it('renders nav element with responsive padding', () => {
			const { container } = render(<Header session={null} />);
			const nav = container.querySelector('nav');
			expect(nav).toHaveClass('p-4');
		});
	});
});
