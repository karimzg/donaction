---
name: design
description: Design system reference for donaction-admin
argument-hint: N/A
---

# Admin Design System Reference

> **Note:** Design rules have been extracted to `docs/rules/admin/03-libs-frameworks/` and design patterns to `aidd/skills/code/`. This document serves as a reference for design system files and configuration.

## Design System Approach

- **Method**: Hybrid - PrimeNG Aura preset + TailwindCSS utilities + SCSS for custom components
- **Theme**: Custom klubr theme with layered CSS architecture

## Design System Files

### Theme Configuration

- **PrimeNG Theme**: @donaction-admin/src/app/shared/utils/theme/theme.preset.ts (Aura preset with custom colors)
- **Theme Provider**: @donaction-admin/src/app/app.config.ts (application-level configuration)

### Styling Files

- **Layout Styles**: @donaction-admin/src/assets/layout/ (typography, spacing, layout patterns)
- **Theme Overrides**: @donaction-admin/src/assets/theme/ (PrimeNG component customizations)
- **Global Styles**: @donaction-admin/src/styles.scss (layer order, base styles)

## Color Palette

See @donaction-admin/src/app/shared/utils/theme/theme.preset.ts for complete color definitions:

- **Primary**: Indigo palette (50-950)
- **Secondary**: Zinc (light mode), Slate (dark mode)
- **Accent**: Orange-400
- **Surface**: Gray variants (0, 50-950)

## Typography

See @donaction-admin/src/assets/layout/_typography.scss for typography system:

- **Primary Font**: Inter
- **Fallback**: sans-serif
- **Font Features**: Configured for branded elements

## Tokens Reference

Design tokens (spacing, radius, shadows, breakpoints) are documented in:
- `docs/rules/admin/03-libs-frameworks/5-design-system-tokens.mdc`

## Component Patterns

UI component patterns and variants are documented in:
- `docs/rules/admin/03-libs-frameworks/6-primeng-theme-usage.mdc`
- `docs/rules/admin/03-libs-frameworks/7-button-variants.mdc`
- `docs/rules/admin/03-libs-frameworks/8-card-patterns.mdc`
- `docs/rules/admin/03-libs-frameworks/9-grid-layouts.mdc`
- `docs/rules/admin/03-libs-frameworks/10-input-states.mdc`

## Accessibility

Accessibility requirements documented in:
- `docs/rules/admin/07-quality/2-accessibility.mdc`
