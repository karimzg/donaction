# PrimeNG v21 Deprecation Fixes - Migration Plan

## Summary

Fix PrimeNG v20/v21 breaking changes identified during build. Two main issues:
1. **Accordion API restructuring**: `p-accordionTab` → `p-accordion-panel` with new structure
2. **Severity type strictness**: `msg.severity` type incompatibility

## Error Analysis

### Build Errors Identified

**Accordion Errors (3 components, ~20 instances):**
- `NG8002`: Can't bind to `activeIndex` (deprecated property)
- `NG8001`: `p-accordionTab` is not a known element (renamed to `p-accordion-panel`)
- Affected files:
  - `klub-house-update.component.html` (multiple accordions with nested structure)
  - `project-update.component.html`
  - TypeScript: `AccordionModule` import present ✅

**Severity Type Errors (2 components):**
- `TS2322`: Type `string` not assignable to severity union type
- PrimeNG v21 requires explicit severity types: `"error" | "success" | "info" | "warn" | "secondary" | "contrast"`
- Affected files:
  - `project-update.component.html`
  - `image-cropper-dialog.component.html`

## Migration Guide References

**Sources:**
- [PrimeNG v20 Migration Guide](https://primeng.org/migration/v20)
- [PrimeNG v21 Migration Guide](https://primeng.org/migration/v21)
- [Angular Accordion Component](https://primeng.org/accordion)
- [Converting from Angular + PrimeNG 17 to 20, Part 2](https://medium.com/@rhetal/converting-from-angular-primeng-17-to-20-part-2-f33a9d26677b)

## Breaking Changes Details

### 1. Accordion API (v20+ Breaking Change)

**Old Structure (v19):**
```html
<p-accordion [activeIndex]="0">
  <p-accordionTab>
    <ng-template pTemplate="header">Header</ng-template>
    Content here
  </p-accordionTab>
</p-accordion>
```

**New Structure (v20+):**
```html
<p-accordion [value]="'0'">
  <p-accordion-panel value="0">
    <p-accordion-header>Header content</p-accordion-header>
    <p-accordion-content>Content here</p-accordion-content>
  </p-accordion-panel>
</p-accordion>
```

**Key Changes:**
- `activeIndex` property → `value` property (accepts string/array for panel IDs)
- `p-accordionTab` → `p-accordion-panel`
- `pTemplate="header"` → `<p-accordion-header>`
- Content wrapping → `<p-accordion-content>`
- Each panel requires unique `value` attribute

**TypeScript Changes:**
```typescript
// OLD
mainAccordionActiveIndex = 0;
mainAccordionActiveIndexChange(index: number) { this.mainAccordionActiveIndex = index; }

// NEW
mainAccordionActiveValue = '0';
mainAccordionActiveValueChange(value: string) { this.mainAccordionActiveValue = value; }
```

### 2. Severity Type Strictness (v20+)

**Issue:**
- Components using `msg.severity` with dynamic string types fail strict type checking
- PrimeNG now enforces union type: `"error" | "success" | "info" | "warn" | "secondary" | "contrast"`

**Solutions:**

**Option A: Type Assertion (Quick Fix)**
```html
<p-message [severity]="msg.severity as any">{{ msg.text }}</p-message>
```

**Option B: Type Guard (Proper Fix)**
```typescript
// In component
getSeverity(severity: string): "error" | "success" | "info" | "warn" | "secondary" | "contrast" {
  const validSeverities = ["error", "success", "info", "warn", "secondary", "contrast"];
  return validSeverities.includes(severity) ? severity as any : "info";
}
```
```html
<p-message [severity]="getSeverity(msg.severity)">{{ msg.text }}</p-message>
```

**Option C: Type Definition (Best Fix)**
```typescript
// Update msg interface
interface Message {
  severity: "error" | "success" | "info" | "warn" | "secondary" | "contrast";
  text: string;
}
```

## Implementation Plan

### Phase 1: Accordion Migration (klub-house-update.component)

**File:** `src/app/routes/klub-house/klub-house-update/klub-house-update.component.html`

**Occurrences:** 4 main accordions + 2 nested sub-accordions

1. **Main Accordion (lines 200-575)**
   - Replace `[activeIndex]` → `[value]`
   - Replace `(activeIndexChange)` → `(valueChange)`
   - Convert 5 `<p-accordionTab>` to `<p-accordion-panel>` with unique values:
     - Panel 0: Director's Word
     - Panel 1: Citation (with nested sub-accordion)
     - Panel 2: Why Klubr
     - Panel 3: Location
     - Panel 4: Image/Text
   - Migrate headers: `<ng-template pTemplate="header">` → `<p-accordion-header>`
   - Wrap content in `<p-accordion-content>`

2. **Citation Sub-Accordion (lines 269-314)**
   - Nested accordion inside Panel 1
   - Convert 1 `<p-accordionTab>` to `<p-accordion-panel value="0">`
   - Migrate structure

3. **Partners Accordion (lines 612-687)**
   - Replace `[activeIndex]` → `[value]`
   - Convert 1 `<p-accordionTab>` to `<p-accordion-panel value="0">`
   - Contains nested sub-accordion

4. **Partners Sub-Accordion (lines 630-685)**
   - Nested accordion
   - Convert 1 `<p-accordionTab>` to `<p-accordion-panel value="0">`

**TypeScript Updates:**
```typescript
// Change variable names and types
mainAccordionActiveIndex: number → mainAccordionActiveValue: string
citationAccordionActiveIndex: number → citationAccordionActiveValue: string
partnersAccordionActiveIndex: number → partnersAccordionActiveValue: string
partnersSubAccordionActiveIndex: number → partnersSubAccordionActiveValue: string

// Update change handlers
mainAccordionActiveIndexChange(event: number) → mainAccordionActiveValueChange(event: string)
citationAccordionActiveIndexChange(event: number) → citationAccordionActiveValueChange(event: string)
partnersAccordionActiveIndexChange(event: number) → partnersAccordionActiveValueChange(event: string)
partnersSubAccordionActiveIndexChange(event: number) → partnersSubAccordionActiveValueChange(event: string)
```

### Phase 2: Accordion Migration (project-update.component)

**File:** `src/app/routes/project/ui/update/project-update.component.html`

1. Identify accordion usage at line 5
2. Apply same migration pattern as Phase 1
3. Update TypeScript if activeIndex used

### Phase 3: Severity Type Fixes

**Files:**
- `src/app/routes/project/ui/update/project-update.component.html` (line 5)
- `src/app/shared/components/medias/image-cropper-dialog/image-cropper-dialog.component.html` (line 6)

**Implementation: Use Type Assertion (Quick Fix)**
```html
<!-- BEFORE -->
<p-message [severity]="msg.severity">{{ msg.text }}</p-message>

<!-- AFTER -->
<p-message [severity]="msg.severity as any">{{ msg.text }}</p-message>
```

**Rationale:** Type assertion is fastest, safest fix without refactoring message interface across codebase.

## Risk Assessment

### High Confidence (9/10)

**✅ Why High Confidence:**
- Clear migration path documented in official PrimeNG guides
- Mechanical find-replace operations with predictable patterns
- AccordionModule already imported ✅
- Only 3 components affected (contained scope)

**⚠️ Potential Risks:**
- Nested accordions may have edge cases with value binding
- Custom CSS classes (`customAccordeon`, `customSubAccordeon`) may need adjustment
- `ng-template pTemplate="header"` complexity in some panels

### Testing Requirements

**Manual Testing:**
1. klub-house-update page: Open/close all accordions and nested sub-accordions
2. Verify activeValue tracking works correctly
3. Test citation and partners sub-accordions
4. project-update page: Verify accordion behavior
5. Verify message severity displays correctly (no visual regressions)

**Build Validation:**
- Run `npm run build` → 0 errors expected
- Run `ng serve` → dev server starts without errors

## Execution Order

1. **Phase 1**: klub-house-update.component (largest, most complex)
2. **Phase 2**: project-update.component
3. **Phase 3**: Severity type fixes (both components)
4. **Validation**: Build + manual testing
5. **Approval**: Wait for user testing before proceeding to next steps

## Estimated Time

- Phase 1: 45 minutes (complex nested structure)
- Phase 2: 15 minutes
- Phase 3: 10 minutes
- Testing & validation: 20 minutes
- **Total: ~90 minutes**

## Next Steps After Approval

1. Execute Phase 1-3 sequentially
2. Run build to verify 0 errors
3. Pause for user testing
4. Proceed to Phase 5-7 of original plan (testing, documentation)
