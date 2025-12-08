---
name: design
description: Design system and UI guidelines
argument-hint: N/A
---

# DESIGN.md

## Design Implementation

- **Design System Approach**: Centralized theme config with Tailwind + SCSS for component-specific styling
- **Styling Method**: Hybrid - Tailwind utility classes + SCSS modules for complex components

## Design System Files

- **Theme Config**: @donaction-frontend/src/config/theme.json (colors, fonts) + @donaction-frontend/tailwind.config.js (Tailwind configuration)
- **Design Components**: @donaction-frontend/src/layouts/components (reusable UI components)
- **Style Guidelines**: @donaction-frontend/src/styles/main.scss (base, buttons, utilities layers)

## Design System

- **Spacing Scale**: Tailwind defaults with custom container padding `1.5rem`
- **Border Radius**: `rounded-md` for buttons, `rounded-3xl` for cards, `rounded-xl` for dropdowns
- **Shadows**: Custom utilities - `shadow-default`, `shadow-xs`, `shadow-sm`, `shadow-md`, `boxBoxShadow` class, `shadow-button` for buttons
- **Breakpoints**: Custom - `xs: 480px`, `sm: 575px`, `md: 768px`, `lg: 1024px`, `xl: 1320px`

- **Color Palette**: See @donaction-frontend/src/config/theme.json

  - Primary: `#000` (black) - Main brand, buttons, text headings
  - Secondary: `#73cfa8` (green) - Accent actions
  - Tertiary: `#fb9289` (coral) - Secondary accent
  - Quaternary: `#fde179` (yellow) - Highlights
  - Quinary: `#73b1ff` (blue) - Info states
  - Senary: `#F4FDFF` (light cyan) - Light backgrounds
  - Body: `#fff` (white) - Main background
  - Border: `#DBDBDB` (light gray) - Borders
  - Text: `#555555` (gray) - Body text
  - Text Dark: `#222222` - Dark text
  - Text Light: `#fffefe` - Light text

- **Typography**: See @donaction-frontend/src/config/theme.json
  - Primary Font: Maven Pro (400, 500, 600, 700) - All text
  - Fallback: sans-serif
  - Base size: `16px`, Scale: `1.23` (exponential heading scale)

## Component Standards and Variantes

- **Button Variants**: `.btn-primary` (filled black), `.btn-outline-primary` (white with black border), sizes: default, `.btn-sm`, `.btn-md`, `.btn-icon` (with icons)
- **Input States**: Default with border, focus ring on dark color, custom select dropdown styling, disabled states handled via Tailwind forms plugin
- **Card Patterns**: `box-shadow` utility, rounded corners `rounded-3xl`, ring states for selection `ring-4 ring-[#CECECE]`

## Layout System

- **Grid System**: Tailwind flexbox + CSS Grid - responsive with breakpoint-specific flex directions
- **Container Widths**: Custom `.minMaxWidth` class - `max-width: min(75vw, 1220px)`, `min-width: min(740px, 100%)`, responsive container with `center: true`
- **Spacing Rules**: Tailwind spacing scale - consistent use of `gap-*`, `p-*`, `m-*` utilities, component-specific SCSS for complex layouts

## Accessibility

- **Color Contrast**: High contrast with black primary and white backgrounds - meets WCAG standards
- **Focus Management**: Custom focus styles with `focus:ring` and `focus:border-dark`, keyboard navigation supported
- **Screen Reader**: ARIA labels on interactive elements (`aria-label` on buttons), semantic HTML structure
