# DESIGN.md

## Design Implementation

- **Design System Approach**: PrimeNG Aura preset with custom klubr theme, TailwindCSS utility classes, layered CSS architecture
- **Styling Method**: Hybrid - PrimeNG components styled via theme preset, TailwindCSS for layout/spacing, SCSS for custom components

## Design System Files

- **Theme Config**: @donaction-admin/src/app/shared/utils/theme/theme.preset.ts (PrimeNG Aura preset), @donaction-admin/src/app/app.config.ts (theme provider)
- **Design Components**: @donaction-admin/src/assets/layout/ (layout SCSS), @donaction-admin/src/assets/theme/ (theme overrides)
- **Style Guidelines**: @donaction-admin/src/styles.scss (global styles, layer order)

## Design System

- **Spacing Scale**: See PrimeNG theme preset - uses TailwindCSS spacing (1rem base)
- **Border Radius**: `12px` for layout elements (cards, sidebar), `6px` for form controls, `32px` for rounded pills
- **Shadows**: `box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.12)` for cards, elevation via PrimeNG theme
- **Breakpoints**: 768px (mobile), 992px (tablet), 1960px (max layout width)

- **Color Palette**: See @donaction-admin/src/app/shared/utils/theme/theme.preset.ts

  - Primary: Indigo palette (50-950) - primary actions, links, brand
  - Secondary: Zinc palette (light mode), Slate (dark mode) - surfaces, borders
  - Accent: Orange-400 (`#FFF0C5` bg, `#FFBB00` text) - warnings, notifications
  - Gray: Surface variants (0, 50-950) - backgrounds, borders, text hierarchy

- **Typography**: See @donaction-admin/src/assets/layout/_typography.scss
  - Primary Font: Inter - body text, UI components
  - Secondary Font: Inter (with font-feature-settings) - branded elements
  - Fallback: sans-serif

## Component Standards and Variantes

- **Button Variants**: PrimeNG buttons with `pButton` directive, severity variants (primary/secondary/success/danger), ripple disabled
- **Input States**: PrimeNG input components, outlined style default, focus/error/disabled states from theme preset
- **Card Patterns**: `.card` class (2rem padding, 12px radius, border, shadow), `surface-card` background, `surface-border` borders

## Layout System

- **Grid System**: CSS Grid with utility classes (`.grid-member-listing`, `.grid-project-listing`, `.grid-user-listing`), auto-fill responsive columns
- **Container Widths**: 1504px max width above 1960px breakpoint, fluid below with 1rem horizontal padding
- **Spacing Rules**: PrimeNG scale 14 (base 14px), TailwindCSS spacing utilities (`px-`, `py-`, `gap-`), consistent 1rem padding on mobile

## Accessibility

- **Color Contrast**: Uses PrimeNG theme contrast ratios, semantic color tokens for status
- **Focus Management**: Focus outline/box-shadow disabled globally (`:focus { outline: none !important; }`), keyboard navigation via PrimeNG
- **Screen Reader**: PrimeNG components include ARIA labels, custom components need manual ARIA
