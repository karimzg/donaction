# Instruction: DONACTION-SAAS UI/UX Refactoring

## Feature

- **Summary**: Refactor donation form UI/UX (steps 1-3) with modern design system while preserving all business logic, state management, and integrations intact
- **Stack**: `Svelte 5`, `SCSS`, `TypeScript`
- **Branch name**: `feature/issue-55b` (current)

## Existing files

- @donaction-saas/src/styles/main.scss
- @donaction-saas/src/components/sponsorshipForm/components/formBody/steps/step1/step1.svelte
- @donaction-saas/src/components/sponsorshipForm/components/formBody/steps/step1/index.scss
- @donaction-saas/src/components/sponsorshipForm/components/formBody/steps/step2/step2.svelte
- @donaction-saas/src/components/sponsorshipForm/components/formBody/steps/step2/index.scss
- @donaction-saas/src/components/sponsorshipForm/components/formBody/steps/step3/step3.svelte
- @donaction-saas/src/components/sponsorshipForm/components/formBody/steps/step3/index.scss
- @donaction-saas/src/components/sponsorshipForm/components/breadcrumb/index.scss
- @donaction-saas/src/components/sponsorshipForm/components/contribution/index.scss

### New file to create

- donaction-saas/src/styles/_design-tokens.scss

## Implementation phases

### Phase 1: Design System Foundation

> Create CSS variables and import structure

1. Create `_design-tokens.scss` with CSS custom properties
   - [ ] 1.1. Define color tokens (primary, accent, success, warning, neutrals)
   - [ ] 1.2. Define typography tokens (font sizes, weights, line heights)
   - [ ] 1.3. Define spacing tokens (xs to 5xl scale)
   - [ ] 1.4. Define border, radius, shadow tokens
   - [ ] 1.5. Define transition tokens
2. Update `main.scss`
   - [ ] 2.1. Add `@use './_design-tokens';` import

### Phase 2: Step 1 Refactoring

> Amount selection UI improvements

1. Update `step1.svelte` HTML structure
   - [ ] 1.1. Add semantic wrapper classes (`don-step1`, `don-section`)
   - [ ] 1.2. Restructure amount buttons with `don-btn-amount` classes
   - [ ] 1.3. Restructure toggle groups with `don-toggle-group` classes
   - [ ] 1.4. Add header section with club info
   - [ ] 1.5. Preserve all Swiper.js carousel logic untouched
   - [ ] 1.6. Preserve all `bind:value`, onclick handlers, $derived variables
2. Update `step1/index.scss`
   - [ ] 2.1. Keep `.projectSelectionContainer` and Swiper styles
   - [ ] 2.2. Add new `.don-step1`, `.don-section` styles
   - [ ] 2.3. Add `.don-btn-amount` button styles
   - [ ] 2.4. Add `.don-toggle-group`, `.don-toggle-btn` styles
   - [ ] 2.5. Add `.don-custom-amount` input styles
   - [ ] 2.6. Add `.don-real-cost` tax display styles

### Phase 3: Step 2 Refactoring

> Personal information form UI improvements

1. Update `step2.svelte` HTML structure
   - [ ] 1.1. Add wrapper class `don-step2`
   - [ ] 1.2. Add header section with `don-step2__header`, `don-step2__title`
   - [ ] 1.3. Add form classes `don-form`, `don-form-group`
   - [ ] 1.4. Add row layout classes `don-form-row--2`, `don-form-row--3`
   - [ ] 1.5. Preserve all `use:validator` directives
   - [ ] 1.6. Preserve all `bind:value` bindings
   - [ ] 1.7. Preserve AdressInputs component usage
2. Update `step2/index.scss`
   - [ ] 2.1. Keep `.proLogoContainer` styles
   - [ ] 2.2. Add `.don-step2`, `.don-step2__header` styles
   - [ ] 2.3. Add `.don-form`, `.don-form-group` styles
   - [ ] 2.4. Add `.don-form-input`, `.don-form-select` styles
   - [ ] 2.5. Add `.don-form-row` grid layouts
   - [ ] 2.6. Add `.don-form-label` styles

### Phase 4: Step 3 Refactoring

> Recap and fee choice UI improvements (most complex)

1. Update `step3.svelte` script section
   - [ ] 1.1. Add `let showFeeDetails = $state(false);` for toggle
2. Update `step3.svelte` HTML structure
   - [ ] 2.1. Add header section with amount display (`don-step3__header`)
   - [ ] 2.2. Restructure fee choice as card layout (`don-options-grid`, `don-option-card`)
   - [ ] 2.3. Keep `<label>` with nested `<input type="radio">` pattern
   - [ ] 2.4. Add fee details toggle section
   - [ ] 2.5. Restructure summary section (`don-summary-layout`, `don-summary-lines`)
   - [ ] 2.6. Add impact card (`don-impact-card`)
   - [ ] 2.7. Add tax flow section (`don-tax-section`, `don-tax-flow`)
   - [ ] 2.8. Add documents section (`don-docs-section`, `don-doc-card`)
   - [ ] 2.9. Keep checkbox grid layout `grid-template-columns: 33px 1fr 1fr`
   - [ ] 2.10. Keep all `use:validator` directives on checkboxes
   - [ ] 2.11. Keep `calculateTaxReduction()` for tax display
   - [ ] 2.12. Preserve CGU slot and Contribution component integration
3. Update `step3/index.scss`
   - [ ] 3.1. Keep `.klubrCGU` styles
   - [ ] 3.2. Add `.don-step3`, `.don-step3__header` styles
   - [ ] 3.3. Add `.don-header-badge`, `.don-header-amount` styles
   - [ ] 3.4. Add `.don-options-grid`, `.don-option-card` styles
   - [ ] 3.5. Add `.don-summary-layout`, `.don-summary-lines` styles
   - [ ] 3.6. Add `.don-impact-card` styles
   - [ ] 3.7. Add `.don-tax-section`, `.don-tax-flow` styles
   - [ ] 3.8. Add `.don-docs-section`, `.don-doc-card` styles
   - [ ] 3.9. Keep `.checkboxesContainer` styles (update to use tokens)

### Phase 5: Shared Components

> Update breadcrumb and contribution styling

1. Update `breadcrumb/index.scss`
   - [ ] 1.1. Replace hardcoded values with design tokens
   - [ ] 1.2. Update font-size, padding, gap to use CSS variables
2. Update `contribution/index.scss`
   - [ ] 2.1. Replace hardcoded values with design tokens
   - [ ] 2.2. Keep Lottie animation integration untouched

## Reviewed implementation

- [ ] Phase 1: Design System Foundation
- [ ] Phase 2: Step 1 Refactoring
- [ ] Phase 3: Step 2 Refactoring
- [ ] Phase 4: Step 3 Refactoring
- [ ] Phase 5: Shared Components

## Validation flow

1. Start dev server: `cd donaction-saas && npm run dev`
2. Open donation form widget in browser
3. Test Step 1:
   - Amount buttons selection works
   - Free amount input works
   - Tax reduction toggle works
   - Particulier/Entreprise toggle works (when tax reduction enabled)
   - Project selection carousel works (if multiple projects)
4. Test Step 2:
   - All form fields fillable
   - Validation errors display
   - Conditional fields appear/disappear correctly
   - Address autocomplete works
5. Test Step 3:
   - Fee choice radio buttons work (both options)
   - Fee details toggle expands/collapses
   - Summary amounts calculate correctly
   - Platform support "Modifier" button opens Contribution
   - Checkboxes work with validation
   - CGU opens and closes
6. Complete full donation flow to Step 4 (Stripe)
7. Test responsive at 768px breakpoint

## Estimations

- **Confidence**: 9/10
  - ✅ Clear scope: only UI/UX, no business logic changes
  - ✅ Current code structure is clean and well-organized
  - ✅ Design tokens approach is standard and maintainable
  - ✅ Existing styles can be incrementally replaced
  - ❌ Risk: Large number of CSS changes may introduce regressions
- **Time to implement**: 4-6 hours
