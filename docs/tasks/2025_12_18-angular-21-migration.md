---
name: angular-21-migration
description: Migrate Angular admin dashboard from v19 to v21 with Signal Forms
argument-hint: N/A
---

# Instruction: Phase 0: Angular 21 Migration (PREREQUISITE)

## Feature

- **Summary**: Migrate Angular dashboard from v19.2.0 to v21 to leverage Signal Forms, modern signal APIs, and latest framework improvements. Critical prerequisite blocking all Epic #4 phases.
- **Stack**: `Angular 21`, `TypeScript 5.6+`, `PrimeNG 21`, `NgRx 21`, `RxJS 7.8+`
- **Branch name**: `feat/issue-13`
- **Issue**: #13
- **Epic**: #4

## Existing files

### Core Configuration
- @donaction-admin/package.json
- @donaction-admin/tsconfig.json
- @donaction-admin/angular.json
- @donaction-admin/src/app/app.config.ts

### Profile Component (Signal Forms Target)
- @donaction-admin/src/app/routes/profile/ui/profile/profile.component.ts
- @donaction-admin/src/app/routes/profile/ui/profile/profile.component.html
- @donaction-admin/src/app/routes/profile/ui/profile/profile.component.scss

### Components with takeUntil Pattern
- @donaction-admin/src/app/routes/dashboard/dashboard.component.ts
- @donaction-admin/src/app/shared/services/analytics/analytics.service.ts
- @donaction-admin/src/app/shared/services/layout.services.ts
- @donaction-admin/src/app/shared/services/menu.service.ts
- @donaction-admin/src/app/shared/components/form/form-media-update/form-media-update.component.ts
- @donaction-admin/src/app/shared/components/form/google-maps/google-maps-api.service.ts
- @donaction-admin/src/app/shared/components/form/google-maps/google-place-autocomplete.directive.ts
- @donaction-admin/src/app/shared/components/medias/image-cropper-dialog/image-cropper-dialog-footer/image-cropper-dialog-footer.component.ts
- @donaction-admin/src/app/shared/components/medias/image-cropper-dialog/image-cropper-dialog.component.ts
- @donaction-admin/src/app/shared/components/medias/informations-image-card/informations-image-card.component.ts

### Documentation
- @docs/memory-bank/admin/AGENTS.md
- @aidd/skills/admin/reactive-form.md

### New files to create
- docs/tasks/2025_12_18-angular-21-migration.md (this file)
- aidd/skills/admin/signal-forms.md (if needed after Phase 6 verification)
- docs/memory-bank/admin/angular-21-migration-guide.md

## Implementation phases

### Phase 1: Pre-Migration Assessment & Backup

> Establish baseline metrics and ensure clean starting state

1. Document current state
   - [ ] Run `npm run build` and record bundle sizes (main, polyfills, vendor)
   - [ ] Run `npm test` and ensure all tests pass
   - [ ] Document current Angular CLI version output
   - [ ] Create inventory of all forms in codebase (find all FormGroup instances)
2. Create migration tracking
   - [ ] List all components using `@Input()` decorator
   - [ ] List all components using `@ViewChild()` decorator
   - [ ] List all files using `takeUntil` pattern (already identified: 10 files)
   - [ ] List all files using `@Component` with `OnInit`, `OnDestroy` lifecycle hooks
3. Backup verification
   - [ ] Ensure branch `feat/issue-13` is created from `epic/4-stripe-connect-migration`
   - [ ] Commit current state with message "chore: baseline before Angular 21 migration"
   - [ ] Verify git status is clean

### Phase 2: Core Framework & Dependency Updates

> Update Angular, TypeScript, and all dependencies to v21-compatible versions

1. Update Angular Core
   - [ ] Run `npx @angular/cli@21 update @angular/core@21 @angular/cli@21 --allow-dirty --force`
   - [ ] Review migration output and schematic changes
   - [ ] Fix any automatic migration errors
   - [ ] Verify angular.json for breaking changes
2. Update TypeScript
   - [ ] Update package.json: `typescript` to `~5.6.0` (Angular 21 requires TS 5.6+)
   - [ ] Run `npm install`
   - [ ] Check for TypeScript compilation errors: `npm run build`
   - [ ] Fix any type errors introduced by TS 5.6
3. Update PrimeNG
   - [ ] Update package.json: `primeng` to `^21.0.0`
   - [ ] Update package.json: `@primeng/themes` to `^21.0.0`
   - [ ] Update package.json: `primeicons` to latest compatible
   - [ ] Run `npm install`
   - [ ] Check PrimeNG changelog for breaking changes
   - [ ] Test critical PrimeNG components (Button, InputText, Card, Dialog, Select)
4. Update NgRx
   - [ ] Update package.json: `@ngrx/store` to `^21.0.0`
   - [ ] Update package.json: `@ngrx/effects` to `^21.0.0`
   - [ ] Update package.json: `@ngrx/signals` to `^21.0.0`
   - [ ] Update package.json: `@ngrx/store-devtools` to `^21.0.0`
   - [ ] Update package.json: `@ngrx/operators` to `^21.0.0`
   - [ ] Run `npm install`
   - [ ] Verify store and effects still work
5. Update remaining Angular packages
   - [ ] Update `@angular/google-maps` to `^21.0.0`
   - [ ] Update `@angular-devkit/build-angular` to `^21.0.0`
   - [ ] Run `npm install`
6. Verify build
   - [ ] Run `npm run build` and fix all compilation errors
   - [ ] Compare bundle sizes to baseline (must be <5% increase)
   - [ ] Run `npm run start` and verify app loads

### Phase 3: Signal Forms Migration

> Migrate profile component to Signal Forms as proof of concept

1. Study Angular 21 Signal Forms API
   - [ ] Review official Angular docs for `FormGroup` signal constructor
   - [ ] Review `FormControl` signal API
   - [ ] Review `FormArray` signal API
   - [ ] Understand how validation works with signal forms
2. Migrate ProfileComponent to Signal Forms
   - [ ] Convert `entityForm` from `new FormGroup()` to signal-based FormGroup
   - [ ] Update form control access in template to use signal syntax
   - [ ] Update form validation to signal-based approach
   - [ ] Convert `currentAvatar` and other form-related signals to signal forms pattern
   - [ ] Update `initForm()` method to use signal forms
   - [ ] Update `onSubmit()` method to work with signal forms
   - [ ] Test all form interactions (input, validation, submit, reset)
3. Update GenericUpdateComponent if needed
   - [ ] Evaluate if GenericUpdateComponent needs signal forms support
   - [ ] If yes: create signal-based version or make it compatible with both
   - [ ] If no: document that profile extends but uses signal forms locally
4. Test and validate
   - [ ] Manual test: load profile page
   - [ ] Manual test: edit profile fields
   - [ ] Manual test: form validation errors display correctly
   - [ ] Manual test: submit form successfully
   - [ ] Manual test: avatar upload/selection
   - [ ] Verify ErrorDisplayComponent works with signal forms
   - [ ] Verify FormControlPipe works with signal forms
5. Document pattern
   - [ ] Document signal forms pattern in code comments
   - [ ] Add migration notes for other developers

### Phase 4: Signal APIs Modernization

> Convert codebase to modern signal-based APIs

1. Convert @Input() to input()
   - [ ] Find all components using `@Input()` decorator
   - [ ] Convert to `input()` or `input.required()` based on whether required
   - [ ] Update component usage sites to use new syntax
   - [ ] Test components after conversion
2. Convert @ViewChild() to viewChild()
   - [ ] Find all components using `@ViewChild()` decorator
   - [ ] Convert to `viewChild()` or `viewChild.required()`
   - [ ] Update access patterns (signals are auto-unwrapped in templates)
   - [ ] Test components after conversion
3. Replace takeUntil with takeUntilDestroyed
   - [ ] Convert dashboard.component.ts
   - [ ] Convert analytics.service.ts
   - [ ] Convert layout.services.ts
   - [ ] Convert menu.service.ts
   - [ ] Convert form-media-update.component.ts
   - [ ] Convert google-maps-api.service.ts
   - [ ] Convert google-place-autocomplete.directive.ts
   - [ ] Convert image-cropper-dialog-footer.component.ts
   - [ ] Convert image-cropper-dialog.component.ts
   - [ ] Convert informations-image-card.component.ts
   - [ ] Remove manual `destroy$` Subject declarations
   - [ ] Remove `OnDestroy` implementations where only used for cleanup
   - [ ] Add `DestroyRef` injection: `private destroyRef = inject(DestroyRef)`
4. Convert computed properties to computed()
   - [ ] Find getter properties that depend on signals
   - [ ] Convert to `computed()` for reactivity
   - [ ] Test computed values update correctly
5. Convert model() for two-way binding
   - [ ] Identify components with two-way bindings
   - [ ] Convert appropriate `@Input()` + `@Output()` pairs to `model()`
   - [ ] Update parent component bindings to use `[(signal)]` syntax

### Phase 5: Testing, Validation & Bundle Optimization

> Ensure zero regressions and performance requirements met

1. Fix TypeScript compilation errors
   - [ ] Run `npm run build` in production mode
   - [ ] Fix all TypeScript errors
   - [ ] Ensure no `any` types were introduced
   - [ ] Verify strict mode compliance
2. Run and fix test suite
   - [ ] Run `npm test`
   - [ ] Fix failing unit tests
   - [ ] Update test mocks for signal APIs
   - [ ] Ensure >80% code coverage maintained
3. Manual testing of critical journeys
   - [ ] User Journey: Login flow
   - [ ] User Journey: Profile update
   - [ ] User Journey: Member management
   - [ ] User Journey: Project creation
   - [ ] User Journey: Donation tracking
   - [ ] User Journey: Invoice generation
   - [ ] Test all PrimeNG components used (Dialog, Select, Button, Card, Table)
4. Bundle size validation
   - [ ] Run `npm run build -- --stats-json`
   - [ ] Compare bundle sizes to Phase 1 baseline
   - [ ] Ensure main bundle increase is <5%
   - [ ] Identify and eliminate any unexpected bundle bloat
   - [ ] Document final bundle size comparison
5. Performance validation
   - [ ] Test app load time in dev mode
   - [ ] Test app load time in production build
   - [ ] Verify no console errors or warnings
   - [ ] Test on Chrome, Firefox, Safari
   - [ ] Verify mobile responsiveness unchanged

### Phase 6: Documentation & Team Enablement

> Document patterns and enable team to use Angular 21 features

1. Update AGENTS.md with Angular 21 patterns
   - [ ] Update @docs/memory-bank/admin/AGENTS.md with Angular 21 version
   - [ ] Document `input()` and `model()` usage patterns
   - [ ] Document `viewChild()` usage patterns
   - [ ] Document `takeUntilDestroyed()` pattern
   - [ ] Document `computed()` pattern
   - [ ] Add migration notes for remaining forms
2. Check for existing Signal Forms documentation
   - [ ] Review @aidd/skills/admin/reactive-form.md
   - [ ] Determine if signal-forms.md skill is needed (reactive-form.md currently uses traditional FormGroup)
   - [ ] If needed: create @aidd/skills/admin/signal-forms.md with profile component as example
3. Create team migration guide
   - [ ] Create @docs/memory-bank/admin/angular-21-migration-guide.md
   - [ ] Document what changed from v19 to v21
   - [ ] Provide before/after code examples for each pattern
   - [ ] Include troubleshooting section for common issues
   - [ ] Add checklist for migrating additional components
4. Code examples and reference implementations
   - [ ] Add inline comments to ProfileComponent explaining signal forms
   - [ ] Document signal forms validation patterns
   - [ ] Document signal forms with GenericUpdateComponent integration
   - [ ] Add examples of `computed()` with forms

## Reviewed implementation

<!-- Filled by review agent after implementation -->

- [ ] Phase 1: Pre-Migration Assessment & Backup
- [ ] Phase 2: Core Framework & Dependency Updates
- [ ] Phase 3: Signal Forms Migration
- [ ] Phase 4: Signal APIs Modernization
- [ ] Phase 5: Testing, Validation & Bundle Optimization
- [ ] Phase 6: Documentation & Team Enablement

## Validation flow

1. Clone repo and checkout `feat/issue-13` branch
2. Install dependencies: `npm install` in donaction-admin
3. Run development server: `npm run start`
4. Navigate to profile page and test form:
   - Edit name, email, phone fields
   - Trigger validation errors by clearing required fields
   - Upload/select avatar
   - Submit form and verify success message
   - Verify form resets correctly
5. Test critical user journeys:
   - Login with test credentials
   - Navigate to members page and filter members
   - Navigate to projects page and create/edit project
   - Navigate to donations page and view donation details
   - Generate invoice
6. Verify no console errors or warnings
7. Build production bundle: `npm run build`
8. Verify bundle size increase is <5% from baseline
9. Run tests: `npm test` - all tests pass
10. Review documentation:
    - Read updated AGENTS.md for Angular 21 patterns
    - Read angular-21-migration-guide.md
    - Review signal-forms.md skill (if created)

## Estimations

- **Confidence**: 8/10
  - ✅ Angular 21 is stable release with clear migration path
  - ✅ Current codebase already uses signals extensively (good foundation)
  - ✅ TypeScript 5.5.4 already in use (close to 5.6 requirement)
  - ✅ Components are standalone (no NgModule migration needed)
  - ✅ Already using modern control flow (`@if`, `@for`)
  - ✅ PrimeNG and NgRx have v21-compatible versions available
  - ❌ Signal Forms are new API - need to verify GenericUpdateComponent compatibility
  - ❌ Profile component extends GenericUpdateComponent - migration complexity
  - ⚠️ 10+ files use takeUntil pattern requiring careful migration
  - ⚠️ Need to verify all PrimeNG components work with Angular 21

- **Time to implement**: 4-5 days
  - Phase 1: 0.5 day (assessment and baseline)
  - Phase 2: 1 day (dependency updates and fixing errors)
  - Phase 3: 1.5 days (Signal Forms migration with GenericUpdateComponent consideration)
  - Phase 4: 1 day (Signal APIs modernization across 10+ files)
  - Phase 5: 0.5 day (testing and bundle optimization)
  - Phase 6: 0.5 day (documentation)

- **Risks**:
  - GenericUpdateComponent may need refactoring for Signal Forms support
  - PrimeNG v21 may have breaking changes in form components
  - Bundle size may exceed 5% threshold requiring optimization
  - Third-party libraries (ng-recaptcha, ngx-editor, etc.) may have compatibility issues

- **Mitigation**:
  - Test GenericUpdateComponent early in Phase 3
  - Review PrimeNG changelog before migration
  - Monitor bundle size after each phase
  - Check third-party library compatibility before Phase 2
