import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HpProjects from './index';
import { getProjectDeadlineInfo } from './helpers';

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

vi.mock('@/components/media/ImageHtml', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

const mockProjets = [
  {
    uuid: 'proj-1',
    slug: 'projet-1',
    titre: 'Projet Test 1',
    couverture: { url: '/img1.jpg', alternativeText: 'Image 1', alt: '', width: 420, height: 236, formats: null, ext: '.jpg', mime: 'image/jpeg', provider: 'local' },
    montantAFinancer: 10000,
    montantTotalDonations: 3000,
    nbDons: 5,
    dateLimiteFinancementProjet: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    sportType: 'Football',
    klubr: {
      uuid: 'klubr-1',
      slug: 'mon-club',
      denomination: 'Mon Club',
      logo: { url: '/logo.png', alt: 'Logo' },
    },
  },
  {
    uuid: 'proj-2',
    slug: 'projet-2',
    titre: 'Projet Test 2',
    couverture: { url: '/img2.jpg', alternativeText: 'Image 2', alt: '', width: 420, height: 236, formats: null, ext: '.jpg', mime: 'image/jpeg', provider: 'local' },
    montantAFinancer: 5000,
    montantTotalDonations: 0,
    nbDons: 0,
    dateLimiteFinancementProjet: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    sportType: '',
    klubr: {
      uuid: 'klubr-2',
      slug: 'autre-club',
      denomination: 'Autre Club',
      logo: { url: '/logo2.png', alt: 'Logo 2' },
    },
  },
  {
    uuid: 'proj-3',
    slug: 'projet-3',
    titre: 'Projet Test 3',
    couverture: { url: '/img3.jpg', alternativeText: 'Image 3', alt: '', width: 420, height: 236, formats: null, ext: '.jpg', mime: 'image/jpeg', provider: 'local' },
    montantAFinancer: 2000,
    montantTotalDonations: 2000,
    nbDons: 12,
    dateLimiteFinancementProjet: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    sportType: 'Tennis',
    klubr: {
      uuid: 'klubr-3',
      slug: 'club-tennis',
      denomination: 'Club Tennis',
      logo: { url: '/logo3.png', alt: 'Logo 3' },
    },
  },
] as any;

describe('HpProjects', () => {
  it('renders section with title', () => {
    render(<HpProjects projets={mockProjets} />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/projets/i);
  });

  it('renders project cards in desktop grid', () => {
    render(<HpProjects projets={mockProjets} />);

    const articles = screen.getAllByRole('article');
    expect(articles.length).toBeGreaterThanOrEqual(3);
  });

  it('renders nothing when no projects', () => {
    const { container } = render(<HpProjects projets={[]} />);

    expect(container.innerHTML).toBe('');
  });

  it('renders CTA link to all projects', () => {
    render(<HpProjects projets={mockProjets} />);

    const ctaLink = screen.getByRole('link', { name: /voir tous les projets/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/projets');
  });

  it('renders project titles', () => {
    render(<HpProjects projets={mockProjets} />);

    expect(screen.getAllByText(/projet test 1/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/projet test 2/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders club names', () => {
    render(<HpProjects projets={mockProjets} />);

    expect(screen.getAllByText(/mon club/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/autre club/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders social proof for projects with donations', () => {
    render(<HpProjects projets={mockProjets} />);

    expect(screen.getAllByText(/mécène/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders status badges', () => {
    render(<HpProjects projets={mockProjets} />);

    const enCoursItems = screen.getAllByText(/en cours/i);
    expect(enCoursItems.length).toBeGreaterThanOrEqual(1);
  });

  it('renders subtitle', () => {
    render(<HpProjects projets={mockProjets} />);

    expect(screen.getByText(/découvrez les projets/i)).toBeInTheDocument();
  });

  it('renders expired badge for past-deadline projects', () => {
    render(<HpProjects projets={mockProjets} />);

    expect(screen.getAllByText(/terminé/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders deadline badge for active projects', () => {
    render(<HpProjects projets={mockProjets} />);

    const deadlineBadges = screen.getAllByText(/J-\d+/);
    expect(deadlineBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders card as div when klubr slug is missing', () => {
    const projetsNoSlug = [{
      ...mockProjets[0],
      uuid: 'proj-no-slug',
      klubr: { ...mockProjets[0].klubr, slug: '' },
    }] as any;

    const { container } = render(<HpProjects projets={projetsNoSlug} />);

    const article = container.querySelector('article');
    expect(article).toBeTruthy();
    const link = article!.querySelector('a');
    expect(link).toBeNull();
  });

  it('handles zero montantAFinancer without division error', () => {
    const projetsZero = [{
      ...mockProjets[0],
      uuid: 'proj-zero',
      montantAFinancer: 0,
      montantTotalDonations: 100,
    }] as any;

    const { container } = render(<HpProjects projets={projetsZero} />);

    const progressFill = container.querySelector('.hp-projects__progress-fill') as HTMLElement;
    expect(progressFill).toBeTruthy();
    expect(progressFill.style.width).toBe('0%');
  });
});

describe('getProjectDeadlineInfo', () => {
  it('returns not expired with daysLeft for future date', () => {
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const result = getProjectDeadlineInfo(future);

    expect(result.isExpired).toBe(false);
    expect(result.daysLeft).toBeGreaterThanOrEqual(9);
    expect(result.daysLeft).toBeLessThanOrEqual(11);
  });

  it('returns expired with null daysLeft for past date', () => {
    const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const result = getProjectDeadlineInfo(past);

    expect(result.isExpired).toBe(true);
    expect(result.daysLeft).toBeNull();
  });

  it('returns defaults for null input', () => {
    const result = getProjectDeadlineInfo(null);

    expect(result.isExpired).toBe(false);
    expect(result.daysLeft).toBeNull();
  });

  it('handles string date input', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const result = getProjectDeadlineInfo(future);

    expect(result.isExpired).toBe(false);
    expect(result.daysLeft).toBeGreaterThanOrEqual(4);
  });
});
