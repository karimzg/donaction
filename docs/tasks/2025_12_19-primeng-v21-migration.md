# Instruction: Phase 0.1: PrimeNG v21 Migration

## Feature

- **Summary**: Upgrade PrimeNG from v19.0.9 to v21.x, migrate renamed components (Sidebar→Drawer, Calendar→DatePicker, OverlayPanel→Popover) across 18 TypeScript files and 2 HTML templates, ensure TypeScript compilation and tests pass
- **Stack**: `Angular 21.0.6`, `PrimeNG 21.x`, `@primeng/themes 21.x`, `TypeScript 5.9.3`, `NgRx 21.0.0`
- **Branch name**: `feat/issue-16`

## Existing files

### Component Files with Direct Imports (6 files)
- @donaction-admin/src/app/routes/dashboard/dashboard.component.ts
- @donaction-admin/src/app/shared/components/project/project-change-limit-date/project-change-limit-date.component.ts
- @donaction-admin/src/app/routes/klub/ui/klub-filters/klub-filters.component.ts
- @donaction-admin/src/app/routes/profile/ui/profile/profile.component.ts
- @donaction-admin/src/app/routes/members/ui/member-filters/member-filters.component.ts
- @donaction-admin/src/app/routes/don/ui/don-filters/don-filters.component.ts

### Component Files with References (18 files)
- @donaction-admin/src/app/routes/dashboard/dashboard.component.ts
- @donaction-admin/src/app/shared/components/header/header.component.ts
- @donaction-admin/src/app/shared/services/layout.services.ts
- @donaction-admin/src/app/shared/components/project/project-change-limit-date/project-change-limit-date.component.ts
- @donaction-admin/src/app/shared/components/sidebar/sidebar.component.spec.ts
- @donaction-admin/src/app/shared/components/sidebar/sidebar.component.ts
- @donaction-admin/src/app/shared/utils/models/tabContent.ts
- @donaction-admin/src/app/routes/users/ui/users-filters/users-filters.component.ts
- @donaction-admin/src/app/routes/klub/ui/klub-filters/klub-filters.component.ts
- @donaction-admin/src/app/routes/profile/ui/profile/profile.component.ts
- @donaction-admin/src/app/routes/members/ui/member-filters/member-filters.component.ts
- @donaction-admin/src/app/routes/don/ui/don-filters/don-filters.component.ts
- @donaction-admin/src/app/routes/don/ui/balance/tab-content/tab-content-service.service.ts
- @donaction-admin/src/app/routes/don/ui/balance/tab-content/tab-content-sidebar/tab-content-sidebar.component.spec.ts
- @donaction-admin/src/app/routes/don/ui/balance/tab-content/tab-content-sidebar/tab-content-sidebar.component.ts
- @donaction-admin/src/app/routes/don/ui/balance/tab-content/tab-content-sidebar/pipe/tap-content-sidebar-title.pipe.spec.ts
- @donaction-admin/src/app/routes/don/ui/balance/tab-content/tab-content-sidebar/pipe/tap-content-sidebar-title.pipe.ts
- @donaction-admin/src/app/routes/don/ui/balance/tab-content/tab-content.component.ts

### HTML Templates (2 files)
- @donaction-admin/src/app/shared/components/header/header.component.html
- @donaction-admin/src/app/routes/dashboard/dashboard.component.html

### Configuration Files
- @donaction-admin/package.json
- @donaction-admin/CLAUDE.md

### New files to create

None - all changes are modifications to existing files

## Implementation phases

### Phase 1: Dependency Upgrade

> Update package.json dependencies to PrimeNG v21 and verify peer dependency compatibility

1. Update package.json dependencies
   - [ ] 1.1. Change `"primeng": "^19.0.9"` to `"primeng": "^21.0.0"`
   - [ ] 1.2. Change `"@primeng/themes": "^19.0.9"` to `"@primeng/themes": "^21.0.0"`
   - [ ] 1.3. Verify primeicons and primeflex versions remain compatible
2. Install dependencies
   - [ ] 2.1. Run `cd donaction-admin && npm install`
   - [ ] 2.2. Verify no peer dependency conflicts in output

### Phase 2: Sidebar → Drawer Migration

> Replace all Sidebar imports, declarations, HTML tags, and ViewChild references with Drawer

1. Update TypeScript imports (6 files with direct imports)
   - [ ] 1.1. Replace `import { Sidebar } from 'primeng/sidebar'` with `import { Drawer } from 'primeng/drawer'`
   - [ ] 1.2. Replace `SidebarModule` with `DrawerModule` in imports arrays
2. Update component declarations and types
   - [ ] 2.1. Replace `Sidebar` type references with `Drawer` in component properties
   - [ ] 2.2. Update `viewChild<Sidebar>()` to `viewChild<Drawer>()`
   - [ ] 2.3. Update method signatures referencing Sidebar type
3. Update HTML templates (2 files)
   - [ ] 3.1. Replace `<p-sidebar>` tags with `<p-drawer>`
   - [ ] 3.2. Replace `</p-sidebar>` closing tags with `</p-drawer>`
   - [ ] 3.3. Verify property bindings remain compatible (visible, position, modal)
4. Verify affected components
   - [ ] 4.1. Dashboard navigation drawer
   - [ ] 4.2. Header menu drawer
   - [ ] 4.3. Filter panels (klub, member, don, profile, users)

### Phase 3: Calendar → DatePicker Migration

> Replace all Calendar imports, declarations, HTML tags, and ViewChild references with DatePicker

1. Update TypeScript imports
   - [ ] 1.1. Replace `import { Calendar } from 'primeng/calendar'` with `import { DatePicker } from 'primeng/datepicker'`
   - [ ] 1.2. Replace `CalendarModule` with `DatePickerModule` in imports arrays
2. Update component declarations and types
   - [ ] 2.1. Replace `Calendar` type references with `DatePicker` in component properties
   - [ ] 2.2. Update `viewChild<Calendar>()` to `viewChild<DatePicker>()`
3. Update HTML templates
   - [ ] 3.1. Replace `<p-calendar>` tags with `<p-datepicker>`
   - [ ] 3.2. Replace `</p-calendar>` closing tags with `</p-datepicker>`
   - [ ] 3.3. Verify property bindings (dateFormat, showTime, selectionMode)
4. Verify affected components
   - [ ] 4.1. project-change-limit-date component
   - [ ] 4.2. Date range filters in filter components

### Phase 4: OverlayPanel → Popover Migration

> Replace all OverlayPanel imports, declarations, HTML tags, and ViewChild references with Popover

1. Update TypeScript imports
   - [ ] 1.1. Replace `import { OverlayPanel } from 'primeng/overlaypanel'` with `import { Popover } from 'primeng/popover'`
   - [ ] 1.2. Replace `OverlayPanelModule` with `PopoverModule` in imports arrays
2. Update component declarations and types
   - [ ] 2.1. Replace `OverlayPanel` type references with `Popover` in component properties
   - [ ] 2.2. Update `viewChild<OverlayPanel>()` to `viewChild<Popover>()`
   - [ ] 2.3. Update method calls: `show()`, `hide()`, `toggle()`
3. Update HTML templates
   - [ ] 3.1. Replace `<p-overlaypanel>` tags with `<p-popover>`
   - [ ] 3.2. Replace `</p-overlaypanel>` closing tags with `</p-popover>`
   - [ ] 3.3. Verify property bindings (appendTo, dismissable)

### Phase 5: TypeScript Compilation & Type Fixes

> Ensure all TypeScript code compiles without errors after component migrations

1. Run TypeScript compilation
   - [ ] 1.1. Execute `cd donaction-admin && npm run build`
   - [ ] 1.2. Capture and review all TypeScript errors
2. Fix ViewChild references
   - [ ] 2.1. Ensure all `viewChild<T>()` signatures match new component types
   - [ ] 2.2. Verify signal-based queries work with new components
3. Fix method call signatures
   - [ ] 3.1. Verify `show()`, `hide()`, `toggle()` methods align with v21 API
   - [ ] 3.2. Update any deprecated property bindings
4. Verify imports cleanup
   - [ ] 4.1. Remove any unused old imports (Sidebar, Calendar, OverlayPanel)
   - [ ] 4.2. Ensure all new imports (Drawer, DatePicker, Popover) are present

### Phase 6: Testing & Validation

> Run unit tests, verify production build, and perform manual testing of affected components

1. Run unit tests
   - [ ] 1.1. Execute `cd donaction-admin && npm run test`
   - [ ] 1.2. Fix any failing tests related to component migrations
   - [ ] 1.3. Update test specs to use Drawer/DatePicker/Popover
2. Verify production build
   - [ ] 2.1. Run production build: `cd donaction-admin && npm run build`
   - [ ] 2.2. Check bundle size (target: <5% increase from 1.62 MB)
   - [ ] 2.3. Verify no console errors in build output
3. Manual testing checklist
   - [ ] 3.1. Test dashboard navigation drawer (open/close)
   - [ ] 3.2. Test header menu drawer (open/close)
   - [ ] 3.3. Test all filter drawers (klub, member, don, profile, users)
   - [ ] 3.4. Test date picker in project-change-limit-date component
   - [ ] 3.5. Test date range filters in filter components
   - [ ] 3.6. Test popover positioning and interactions
4. Verify no regressions
   - [ ] 4.1. Check browser console for runtime errors
   - [ ] 4.2. Verify animations and transitions work
   - [ ] 4.3. Test responsive behavior on mobile

### Phase 7: Documentation Update

> Update project documentation to reflect PrimeNG v21 migration completion

1. Update CLAUDE.md
   - [ ] 1.1. Change `PrimeNG 19` to `PrimeNG 21` in Stack section
   - [ ] 1.2. Update Angular 21 Migration section: change `⏳ PrimeNG v21: Deferred` to `✅ PrimeNG v21: Complete`
   - [ ] 1.3. Add migration completion date

## Reviewed implementation

- [ ] Phase 1: Dependency Upgrade
- [ ] Phase 2: Sidebar → Drawer Migration
- [ ] Phase 3: Calendar → DatePicker Migration
- [ ] Phase 4: OverlayPanel → Popover Migration
- [ ] Phase 5: TypeScript Compilation & Type Fixes
- [ ] Phase 6: Testing & Validation
- [ ] Phase 7: Documentation Update

## Validation flow

1. Developer upgrades PrimeNG dependencies in package.json and runs npm install
2. Developer migrates all Sidebar → Drawer across 18 TypeScript files and 2 HTML templates
3. Developer migrates all Calendar → DatePicker in affected components
4. Developer migrates all OverlayPanel → Popover in affected components
5. Developer runs `npm run build` and verifies no TypeScript errors
6. Developer runs `npm run test` and verifies all tests pass
7. Developer manually tests dashboard navigation drawer, header menu drawer, and all filter components
8. Developer manually tests date picker in forms and date range filters
9. Developer manually tests popover positioning and interactions
10. Developer verifies production build succeeds with acceptable bundle size
11. Developer checks browser console for runtime errors and visual regressions
12. QA performs cross-browser testing (Chrome, Firefox, Safari, Edge)
13. QA verifies mobile responsive behavior

## Estimations

**Confidence: 9.5/10**

✅ **High Confidence Reasons:**
- Clear scope: 18 TypeScript files, 2 HTML templates, well-defined component renames
- PrimeNG v21 migration guide available with explicit mapping (Sidebar→Drawer, Calendar→DatePicker, OverlayPanel→Popover)
- No breaking API changes in v21 (semantic versioning policy maintained)
- Angular 21 migration already completed (#13), foundation stable
- Codebase uses modern signal-based patterns (viewChild), compatible with v21
- Component migrations are mechanical find-replace operations with predictable outcomes
- Test suite exists to catch regressions

❌ **Potential Risks:**
- Minor risk: Undocumented property binding changes between v19→v21 may surface during manual testing
- Bundle size increase could exceed 5% target (need to verify tree-shaking works for new components)

**Time to implement: 3-4 hours**
- Phase 1: 15 minutes (dependency upgrade)
- Phase 2: 60 minutes (Sidebar→Drawer across 18 files)
- Phase 3: 30 minutes (Calendar→DatePicker migration)
- Phase 4: 20 minutes (OverlayPanel→Popover migration)
- Phase 5: 30 minutes (TypeScript compilation fixes)
- Phase 6: 60 minutes (testing and validation)
- Phase 7: 10 minutes (documentation update)
