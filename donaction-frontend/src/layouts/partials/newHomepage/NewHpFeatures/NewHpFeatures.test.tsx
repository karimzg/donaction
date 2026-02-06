import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NewHpFeatures from "./index";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    "aria-label"?: string;
  }) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

describe("NewHpFeatures", () => {
  it("renders section title", () => {
    render(<NewHpFeatures />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/fonctionnalités/i);
  });

  it("renders both tier badges", () => {
    render(<NewHpFeatures />);

    expect(screen.getByText(/gratuit/i)).toBeInTheDocument();
    expect(screen.getByText(/premium/i)).toBeInTheDocument();
  });

  it("renders all 4 free feature cards", () => {
    render(<NewHpFeatures />);

    const freeList = screen.getByRole("list", { name: /gratuites/i });
    const freeItems = freeList.querySelectorAll("li");
    expect(freeItems).toHaveLength(4);
  });

  it("renders all 4 premium feature cards", () => {
    render(<NewHpFeatures />);

    const premiumList = screen.getByRole("list", { name: /premium/i });
    const premiumItems = premiumList.querySelectorAll("li");
    expect(premiumItems).toHaveLength(4);
  });

  it("renders free feature titles", () => {
    render(<NewHpFeatures />);

    expect(screen.getByText(/page club/i)).toBeInTheDocument();
    expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/reçus fiscaux/i)).toBeInTheDocument();
  });

  it("renders premium feature titles", () => {
    render(<NewHpFeatures />);

    expect(screen.getByText(/cagnottes/i)).toBeInTheDocument();
    expect(screen.getByText(/widget/i)).toBeInTheDocument();
    expect(screen.getByText(/export/i)).toBeInTheDocument();
    expect(screen.getByText(/virement/i)).toBeInTheDocument();
  });

  it("renders feature subtitles", () => {
    render(<NewHpFeatures />);

    // Free subtitles
    expect(screen.getByText(/formulaire de don/i)).toBeInTheDocument();
    expect(screen.getByText(/suivi des dons/i)).toBeInTheDocument();
    expect(screen.getByText(/alertes/i)).toBeInTheDocument();
    expect(screen.getByText(/cerfa/i)).toBeInTheDocument();

    // Premium subtitles
    expect(screen.getByText(/financement participatif/i)).toBeInTheDocument();
    expect(screen.getByText(/intégration/i)).toBeInTheDocument();
    expect(screen.getByText(/comptables/i)).toBeInTheDocument();
    expect(screen.getByText(/automatiques/i)).toBeInTheDocument();
  });

  it("renders SVG icons for each card with aria-hidden", () => {
    const { container } = render(<NewHpFeatures />);

    const svgIcons = container.querySelectorAll("svg");
    // 8 feature icons + 2 badge icons (checkmark and star)
    expect(svgIcons).toHaveLength(10);

    svgIcons.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("has proper accessibility structure", () => {
    render(<NewHpFeatures />);

    // Two lists with aria-labels
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBeGreaterThanOrEqual(2);

    // Lists should have aria-labels
    expect(
      screen.getByRole("list", { name: /gratuites/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("list", { name: /premium/i })).toBeInTheDocument();
  });

  it("renders as a section element", () => {
    const { container } = render(<NewHpFeatures />);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("new-hp-features");
  });

  it("free tier links to /inscription", () => {
    render(<NewHpFeatures />);

    const freeLink = screen.getByLabelText(/offre Gratuite/i);
    expect(freeLink).toHaveAttribute("href", "/inscription");
  });

  it("premium tier links to /inscription with plan query param", () => {
    render(<NewHpFeatures />);

    const premiumLink = screen.getByLabelText(/offre Premium/i);
    expect(premiumLink).toHaveAttribute("href", "/inscription?plan=premium");
  });
});
