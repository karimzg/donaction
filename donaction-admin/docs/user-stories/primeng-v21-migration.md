# User Story: PrimeNG v21 Migration

**Epic**: Technical Debt & Modernization
**Priority**: High
**Estimated Effort**: 3-5 days
**Dependencies**: Angular 21 Migration (#13) must be completed

---

## 📋 Summary

Upgrade PrimeNG from v19.0.9 to v21.x to leverage latest features, bug fixes, and maintain compatibility with Angular 21's ecosystem.

**Blocked Reason**: PrimeNG v21 introduces breaking API changes that require component refactoring across the codebase.

---

## 🎯 User Story

**As a** developer maintaining the Donaction Admin Dashboard
**I want to** upgrade PrimeNG to v21
**So that** we can access the latest UI improvements, security patches, and ensure long-term compatibility with Angular 21

---

## 🔍 Context

During the Angular 21 migration (#13), PrimeNG v21 upgrade was intentionally deferred due to breaking changes:

### Breaking Changes in PrimeNG v21:
1. **`sidebar` → `drawer`**: Component renamed with new import path
2. **`calendar` → `datepicker`**: Component renamed with new API
3. **`overlaypanel` → `popover`**: Component renamed with new behavior

### Current Impact:
- **18 TypeScript files** contain references to affected components
- **78 total occurrences** of Sidebar, Calendar, OverlayPanel across codebase
- **6 files** with direct imports from `primeng/sidebar`, `primeng/calendar`, `primeng/overlaypanel`
- **2 HTML templates** with direct usage

### Affected Files:
```
TypeScript Imports (6 files):
- src/app/routes/dashboard/dashboard.component.ts
- src/app/routes/profile/ui/profile/profile.component.ts
- src/app/routes/klub/ui/klub-filters/klub-filters.component.ts
- src/app/routes/members/ui/member-filters/member-filters.component.ts
- src/app/routes/don/ui/don-filters/don-filters.component.ts
- src/app/shared/components/project/project-change-limit-date/project-change-limit-date.component.ts

HTML Templates (2 files):
- src/app/routes/dashboard/dashboard.component.html
- src/app/shared/components/header/header.component.html

Additional References (10+ files):
- Sidebar service, models, specs
- Tab content components
- Filter components
- Header component
```

---

## ✅ Acceptance Criteria

### 1. Dependency Updates
- [ ] Upgrade `primeng` to `^21.0.0` in package.json
- [ ] Upgrade `@primeng/themes` to `^21.0.0` (keep in sync)
- [ ] Run `npm install` successfully with no peer dependency conflicts
- [ ] Verify `primeicons` and `primeflex` compatibility

### 2. Component Refactoring

#### Sidebar → Drawer Migration
- [ ] Replace all imports: `primeng/sidebar` → `primeng/drawer`
- [ ] Update component declarations: `Sidebar` → `Drawer`
- [ ] Rename HTML tags: `<p-sidebar>` → `<p-drawer>`
- [ ] Update property bindings per v21 API:
  - `visible` → `visible` (unchanged)
  - `position` → `position` (verify behavior)
  - `showCloseIcon` → Update to new API
- [ ] Test sidebar/drawer functionality in:
  - Dashboard navigation
  - Header menu
  - Tab content panels
  - Filter panels (4 locations)

#### Calendar → DatePicker Migration
- [ ] Replace all imports: `primeng/calendar` → `primeng/datepicker`
- [ ] Update component declarations: `Calendar` → `DatePicker`
- [ ] Rename HTML tags: `<p-calendar>` → `<p-datepicker>`
- [ ] Update property bindings per v21 API:
  - `ngModel` / `formControl` (verify compatibility)
  - `dateFormat` → Check new format syntax
  - `showTime` → Verify time picker behavior
  - `selectionMode` → Validate range selection
- [ ] Test date selection in:
  - Project limit date component
  - Filter components (date range filters)
  - Any form date inputs

#### OverlayPanel → Popover Migration
- [ ] Replace all imports: `primeng/overlaypanel` → `primeng/popover`
- [ ] Update component declarations: `OverlayPanel` → `Popover`
- [ ] Rename HTML tags: `<p-overlaypanel>` → `<p-popover>`
- [ ] Update method calls: `toggle()`, `show()`, `hide()`
- [ ] Verify positioning logic and triggers
- [ ] Test popover functionality in all usage locations

### 3. TypeScript Type Updates
- [ ] Update all component type references in TypeScript files
- [ ] Fix any type errors from API changes
- [ ] Update `@ViewChild` references:
  ```typescript
  // Before
  @ViewChild('sidebar') sidebar: Sidebar;

  // After
  @ViewChild('drawer') drawer: Drawer;
  ```
- [ ] Verify all component method calls match v21 API

### 4. Service & Model Updates
- [ ] Update `layout.services.ts` (9 references)
- [ ] Update `tabContent.ts` model (2 references)
- [ ] Update sidebar-related services
- [ ] Update any custom wrappers or utilities

### 5. Testing
- [ ] All affected components render correctly
- [ ] No console errors related to PrimeNG
- [ ] Sidebar/drawer opens and closes properly
- [ ] Date picker accepts input and emits values
- [ ] Popover positioning works across viewports
- [ ] Filter panels function correctly (4 filter components)
- [ ] Dashboard navigation works
- [ ] Profile page sidebar works
- [ ] Header menu drawer works
- [ ] Run unit tests: `ng test`
- [ ] Fix any broken tests related to component changes

### 6. Build & Bundle
- [ ] Production build succeeds: `ng build`
- [ ] No PrimeNG-related build warnings
- [ ] Bundle size impact documented (target: <5% increase)
- [ ] Verify tree-shaking works for new components

### 7. Documentation
- [ ] Update CHANGELOG.md with PrimeNG v21 upgrade notes
- [ ] Document breaking changes in migration notes
- [ ] Update component usage examples if patterns changed
- [ ] Add notes to `docs/rules/admin/` if new patterns emerge

---

## 🛠️ Implementation Plan

### Phase 1: Preparation
1. Create branch: `feat/primeng-v21-migration`
2. Backup current PrimeNG v19 behavior (screenshots/videos)
3. Review PrimeNG v21 migration guide
4. Document current component usage patterns

### Phase 2: Dependency Update
1. Update package.json dependencies
2. Install packages with `npm install`
3. Resolve any peer dependency conflicts

### Phase 3: Automated Refactoring
1. Use find-and-replace for import statements
2. Use find-and-replace for component class names
3. Use find-and-replace for HTML tags
4. Run TypeScript compiler to identify remaining errors

### Phase 4: Manual Fixes
1. Fix TypeScript errors from API changes
2. Update property bindings per v21 API docs
3. Update method calls on component instances
4. Fix ViewChild references

### Phase 5: Testing & Validation
1. Manual testing of each affected component
2. Run unit tests and fix failures
3. Production build and bundle analysis
4. Cross-browser testing

### Phase 6: Documentation & Cleanup
1. Update documentation
2. Commit changes with detailed message
3. Create pull request with migration notes

---

## 🔗 Resources

- [PrimeNG v21 Release Notes](https://github.com/primefaces/primeng/releases)
- [PrimeNG v21 Migration Guide](https://primeng.org/installation#migration)
- [Drawer Component Docs](https://primeng.org/drawer)
- [DatePicker Component Docs](https://primeng.org/datepicker)
- [Popover Component Docs](https://primeng.org/popover)

---

## 🚧 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API changes break functionality | High | Thorough testing of each component |
| New bugs in PrimeNG v21 | Medium | Test on staging before production |
| Bundle size increase | Low | Monitor bundle analyzer output |
| Third-party incompatibilities | Low | Check theme and plugin compatibility |

---

## 📊 Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Unit tests passing
- [ ] Manual testing completed
- [ ] Production build successful
- [ ] Documentation updated
- [ ] PR merged to main branch
- [ ] Deployed to staging environment
- [ ] Verified in staging

---

## 📝 Notes

- This upgrade was intentionally deferred during Angular 21 migration (#13)
- PrimeNG v19 works with Angular 21, but v21 provides better long-term support
- Consider upgrading during a sprint with lower feature velocity
- Allocate time for thorough testing across all filter and navigation components
