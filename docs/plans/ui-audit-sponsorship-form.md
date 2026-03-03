# UI/UX Audit & Enhancement Plan: Sponsorship Form Widget

> **Target**: `donaction-saas` - Embeddable sponsorship form web component
> **Created**: 2025-01-16
> **Status**: Pending Approval

---

## Executive Summary

Comprehensive UI/UX enhancement plan for the Klubr sponsorship form widget, focusing on:
1. **Brand identity integration** - Replace decorative corners with functional theming
2. **Interactive feedback** - Improve hover, focus, and transition states
3. **Accessibility compliance** - WCAG 2.1 AA conformance
4. **Motion design** - Smooth animations with reduced-motion support

---

## Phase 0: Association Identity Integration

### Objective
Replace decorative corner banners with **functional brand theming** that injects association identity into UI components.

### Current State
- ✅ Logo exists (styled text below title)
- ✅ 2 brand colors available (`--color-primary`, `--color-secondary`)
- ❌ Colors only used for decorative corner banners
- ❌ Interactive elements ignore brand colors (black CTA, gray toggles)

### 0.1 Remove Corner Banners
- Delete top-right and bottom-left diagonal decorative elements
- Reclaim screen real estate

### 0.2 Compact Branded Header (Mobile-First)

**Mobile (< 640px):**
```
┌─────────────────────────────────┐
│ [LOGO]  Association    ● ○ ○ ○ │  ← Single row, logo 24px
├─────────────────────────────────┤
│         FORM CONTENT            │
└─────────────────────────────────┘
```

**Tablet+ (≥ 640px):**
```
┌───────────────────────────────────────────┐
│ [LOGO]  Association Name     ● ○ ○ ○  [X] │  ← Logo 32px
├───────────────────────────────────────────┤
│              FORM CONTENT                 │
└───────────────────────────────────────────┘
```

**Header specs:**
| Property | Mobile | Desktop |
|----------|--------|---------|
| Height | 48px | 56px |
| Logo max-height | 24px | 32px |
| Content padding | 16px | 24-32px |
| Background | White with 1px bottom border |
| Progress | Dots only | Dots (no labels) |

### 0.3 Themed Interactive Elements

| Element | Current | Themed |
|---------|---------|--------|
| Selected amount button | `bg: #111827` (black) | `bg: var(--color-primary)` |
| Selected toggle button | `bg: #111827` | `bg: var(--color-primary)` |
| Primary CTA | `bg: #000` | `bg: var(--color-primary)` |
| Cost badge | `bg: #111827` | `bg: var(--color-primary)` |
| Focus rings | Browser default | `outline: 2px solid var(--color-primary)` |
| Info banner | No accent | `border-left: 3px solid var(--color-primary)` |
| Progress active dot | N/A | `bg: var(--color-primary)` |

### 0.4 CSS Variables Structure

```css
:host {
  /* Brand colors (injected per association) */
  --color-primary: #3bacf7;
  --color-secondary: #050505;

  /* Derived tokens */
  --color-primary-hover: color-mix(in srgb, var(--color-primary) 85%, black);
  --color-primary-light: color-mix(in srgb, var(--color-primary) 15%, white);

  /* Layout tokens */
  --header-height: 48px;
  --logo-size: 24px;
  --content-padding: 16px;
  --btn-min-width: 70px;
}

@media (min-width: 640px) {
  :host {
    --header-height: 56px;
    --logo-size: 32px;
    --content-padding: 24px;
    --btn-min-width: 80px;
  }
}
```

### 0.5 Mobile-Specific Considerations

| Concern | Solution |
|---------|----------|
| Touch targets | All buttons min `44px` height (WCAG) |
| Amount buttons overflow | Flex-wrap, 2x2 grid on < 400px |
| CTA visibility | Sticky bottom bar on mobile |
| Header space | Slim 48px, no tagline on mobile |

### 0.6 Files to Modify

1. `donaction-saas/src/lib/sponsorshipForm/index.svelte` - Header + remove corners
2. `donaction-saas/src/lib/sponsorshipForm/` styles - CSS variables + theming
3. Button/toggle/badge components - Apply CSS variables

### 0.7 Acceptance Criteria

- [ ] Corner banners removed
- [ ] Header displays logo + progress dots
- [ ] All selected states use `--color-primary`
- [ ] CTA button uses `--color-primary`
- [ ] Focus rings use `--color-primary`
- [ ] Info banner has primary-colored left border
- [ ] Mobile: 2x2 amount grid on screens < 400px
- [ ] Mobile: Sticky CTA footer
- [ ] Touch targets ≥ 44px
- [ ] Works with any 2-color combination

---

## Phase 1: Static UI Improvements

### 1.1 Visual Hierarchy (High Priority)

| Issue | Fix |
|-------|-----|
| Breadcrumb low contrast | Bold/dark for active step, add progress dots |
| Info banner blends in | Add `border-left: 3px solid var(--color-primary)` |
| Tax cost display plain | Animate value changes, add "You save X€" |

### 1.2 Typography & Spacing (Medium Priority)

| Issue | Fix |
|-------|-----|
| 14px form labels | Increase to 15-16px |
| Inconsistent vertical rhythm | Standardize `space-y-6` (24px) between sections |
| Currency symbol disconnected | Use input group addon pattern |
| Question line-height | Set `line-height: 1.5` |

### 1.3 Component Consistency (Low Priority)

| Issue | Fix |
|-------|-----|
| Inconsistent border-radius | Standardize to 8px across all elements |
| Close button no hover | Add hover background circle |

---

## Phase 2: Interactive States Enhancement

### 2.1 Hover States (High Priority)

```css
/* Amount buttons */
.don-btn-amount:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Primary CTA */
.primary-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### 2.2 Focus States (High Priority)

```css
/* Universal focus ring */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Input focus */
input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
```

### 2.3 Info Icon Tooltip (High Priority)

- Implement hover tooltip with 200ms fade-in
- Or click-triggered popover for mobile
- Add `aria-describedby` for accessibility

### 2.4 Click Feedback (Medium Priority)

```css
/* Press effect */
.don-btn-amount:active {
  transform: scale(0.98);
}

/* Toggle sliding indicator */
.toggle-group {
  position: relative;
}
.toggle-indicator {
  position: absolute;
  transition: transform 200ms ease-out;
  background: var(--color-primary);
}
```

---

## Phase 3: Animation & Transitions

### 3.1 Conditional Section Reveal (High Priority)

```css
.conditional-section {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 200ms ease-out, opacity 200ms ease-out;
}

.conditional-section.visible {
  grid-template-rows: 1fr;
  opacity: 1;
}

.conditional-section > div {
  overflow: hidden;
}
```

### 3.2 Number Animation for Cost Display (Low Priority)

```svelte
<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const cost = tweened(0, { duration: 300, easing: cubicOut });
  $: cost.set(calculatedCost);
</script>

<span class="cost-value">{Math.round($cost)} €</span>
```

### 3.3 Reduced Motion Support (High Priority)

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Phase 4: Accessibility Compliance

### 4.1 ARIA Roles (High Priority)

```svelte
<!-- Amount selection -->
<div role="radiogroup" aria-labelledby="amount-label">
  <button
    role="radio"
    aria-checked={selected === 10}
    aria-label="Sélectionner 10 euros"
  >
    10 €
  </button>
  <!-- ... -->
</div>

<!-- Toggle groups -->
<div role="radiogroup" aria-labelledby="tax-reduction-label">
  <button role="radio" aria-checked={taxReduction === false}>Non</button>
  <button role="radio" aria-checked={taxReduction === true}>Oui</button>
</div>
```

### 4.2 Keyboard Navigation (High Priority)

- Arrow keys navigate within radiogroups
- Tab moves between groups
- Enter/Space activates selection

### 4.3 Semantic Structure (Medium Priority)

```svelte
<nav aria-label="Étapes du formulaire">
  <!-- Breadcrumb/progress -->
</nav>

<form aria-labelledby="form-title">
  <!-- Form content -->
</form>
```

### 4.4 Info Icon Accessibility (High Priority)

```svelte
<button
  aria-label="Plus d'informations sur les justificatifs"
  aria-expanded={tooltipOpen}
  aria-controls="tooltip-content"
>
  <InfoIcon />
</button>
<div id="tooltip-content" role="tooltip" hidden={!tooltipOpen}>
  <!-- Tooltip content -->
</div>
```

---

## Phase 5: Polish & QA

### 5.1 Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 5.2 Responsive Testing
- [ ] 320px (small mobile)
- [ ] 375px (iPhone)
- [ ] 414px (large phone)
- [ ] 640px (tablet portrait)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)
- [ ] 1280px+ (large desktop)

### 5.3 Accessibility Testing
- [ ] Keyboard navigation
- [ ] Screen reader (VoiceOver/NVDA)
- [ ] Color contrast (axe-core)
- [ ] Reduced motion preference

### 5.4 Brand Theming Testing
- [ ] Test with high-contrast color pairs
- [ ] Test with low-contrast color pairs
- [ ] Test with light primary color
- [ ] Test with dark primary color

---

## Implementation Order

| Phase | Priority | Estimated Effort |
|-------|----------|------------------|
| Phase 0: Brand Identity | **Critical** | Medium |
| Phase 2.1-2.2: Hover/Focus | High | Low |
| Phase 3.1: Section Reveal | High | Low |
| Phase 4.1-4.2: ARIA + Keyboard | High | Medium |
| Phase 3.3: Reduced Motion | High | Low |
| Phase 1: Static UI | Medium | Low |
| Phase 2.3-2.4: Tooltips/Clicks | Medium | Medium |
| Phase 4.3-4.4: Semantics | Medium | Low |
| Phase 3.2: Number Animation | Low | Low |
| Phase 5: QA | **Required** | Medium |

---

## Success Metrics

- **Accessibility**: 0 violations in axe-core audit
- **Performance**: No layout shifts during animations (CLS < 0.1)
- **Brand**: Association colors visible on all interactive elements
- **Mobile**: All touch targets ≥ 44px, sticky CTA visible

---

## Notes

- All transitions should be 150-300ms for micro-interactions
- Use `ease-out` for enter animations, `ease-in` for exit
- CSS variables enable runtime theme switching without rebuild
- Test with `prefers-reduced-motion: reduce` in DevTools

