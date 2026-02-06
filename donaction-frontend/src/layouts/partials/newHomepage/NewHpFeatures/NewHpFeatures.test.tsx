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
  it("renders as a section element with correct BEM class", () => {
    const { container } = render(<NewHpFeatures />);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("new-hp-features");
  });

  it("renders section title", () => {
    render(<NewHpFeatures />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/nos offres/i);
  });

  it("renders both tier badges", () => {
    render(<NewHpFeatures />);

    const gratuitElements = screen.getAllByText(/gratuit/i);
    expect(gratuitElements.length).toBeGreaterThanOrEqual(1);

    const premiumElements = screen.getAllByText(/premium/i);
    expect(premiumElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders free tier price as 0\u20ac", () => {
    render(<NewHpFeatures />);

    const priceElements = screen.getAllByText("0\u20ac");
    expect(priceElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders premium tier price as 69\u20ac", () => {
    render(<NewHpFeatures />);

    expect(screen.getByText("69\u20ac")).toBeInTheDocument();
  });

  it("renders fee rates for both tiers", () => {
    render(<NewHpFeatures />);

    expect(screen.getByText("6%")).toBeInTheDocument();
    expect(screen.getByText("1,75%")).toBeInTheDocument();
  });

  it("renders fee labels with asterisk", () => {
    render(<NewHpFeatures />);

    const feeLabels = screen.getAllByText("Frais plateforme*");
    expect(feeLabels).toHaveLength(2);
  });

  it("renders footnotes inside each tier card", () => {
    render(<NewHpFeatures />);

    expect(
      screen.getByText(/frais bancaires.*fonctionnement/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/uniquement les frais bancaires/i)
    ).toBeInTheDocument();
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

  it("renders free CTA linking to /inscription", () => {
    render(<NewHpFeatures />);

    const freeLink = screen.getByLabelText(/offre Gratuite/i);
    expect(freeLink).toHaveAttribute("href", "/inscription");
    expect(freeLink).toHaveTextContent(/commencer gratuitement/i);
  });

  it("renders premium CTA linking to /inscription?plan=premium", () => {
    render(<NewHpFeatures />);

    const premiumLink = screen.getByLabelText(/offre Premium/i);
    expect(premiumLink).toHaveAttribute("href", "/inscription?plan=premium");
    expect(premiumLink).toHaveTextContent(/choisir premium/i);
  });

  it("renders donation example section", () => {
    render(<NewHpFeatures />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    const exampleHeading = headings.find((h) => /100/.test(h.textContent || ""));
    expect(exampleHeading).toBeDefined();
    expect(exampleHeading).toHaveTextContent(/100\u20ac/);
  });

  it("donation example shows correct amounts", () => {
    render(<NewHpFeatures />);

    expect(screen.getByText("94\u20ac")).toBeInTheDocument();
    expect(screen.getByText("98.25\u20ac")).toBeInTheDocument();
  });

  it("SVG icons have aria-hidden", () => {
    const { container } = render(<NewHpFeatures />);

    const svgIcons = container.querySelectorAll("svg");
    expect(svgIcons.length).toBeGreaterThan(0);

    svgIcons.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("has proper accessibility structure", () => {
    render(<NewHpFeatures />);

    const lists = screen.getAllByRole("list");
    expect(lists.length).toBeGreaterThanOrEqual(2);

    expect(
      screen.getByRole("list", { name: /gratuites/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: /premium/i })
    ).toBeInTheDocument();
  });
});
