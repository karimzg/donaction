# Angular 21 Upgrade Summary - Phase 2 Complete

## Versions Upgraded

### Angular Core
- **From**: 19.2.0 → **To**: 21.0.6
- TypeScript: 5.5.4 → 5.9.3

### Framework Updates
- @angular/cli: 19.2.0 → 21.0.4
- @angular-devkit/build-angular: 19.2.0 → 21.0.4
- @angular/google-maps: 19.2.1 → 21.0.0

### State Management
- @ngrx/store: 19.0.1 → 21.0.0
- @ngrx/effects: 19.0.1 → 21.0.0
- @ngrx/signals: 19.0.1 → 21.0.0
- @ngrx/store-devtools: 19.0.1 → 21.0.0
- @ngrx/operators: 19.0.1 → 21.0.0

### UI Libraries (Kept at v19)
- PrimeNG: 19.0.9 (not upgraded to v21 - breaking changes)
- @primeng/themes: 19.0.9

### Other Updates
- ngx-cookie-service: 19.1.2 → 21.0.0

## Breaking Changes Fixed

### 1. rxResource API Change
**File**: `src/app/shared/components/klub/stats/klub-stats/klub-stats.component.ts`
- `request` → `params`
- `loader` → `stream`

### 2. Null Safety Improvements  
**Files**: Multiple dialog components
- Added optional chaining: `ref.onClose` → `ref?.onClose`
- Files affected: 6 components

### 3. TypeScript Strict Null Checks
- Fixed `@HostListener` event parameter type
- Fixed dialog reference null checks

### 4. Control Flow Migration (Automatic)
- Angular CLI automatically migrated some templates to new `@if/@for` syntax
- 12 files modified by schematics

## Bundle Size Impact

| Metric | Angular 19 | Angular 21 | Change |
|--------|------------|------------|--------|
| Raw Size | 1.61 MB | 1.62 MB | +0.01 MB (+0.62%) |
| Transfer Size | 329.12 kB | 333.13 kB | +4.01 kB (+1.22%) |

✅ **Well under 5% threshold**

## Known Issues

### PrimeNG v21 Migration Deferred
- PrimeNG v21 has breaking API changes:
  - `sidebar` → `drawer`
  - `calendar` → `datepicker`
  - `overlaypanel` → `popover`
- **Decision**: Keep PrimeNG v19 for Angular 21 migration
- **Recommendation**: Handle PrimeNG v21 upgrade as separate task

### Third-Party Compatibility
- `ng-recaptcha@13.2.1`: Still on Angular 17 peer deps
  - Installed with `--legacy-peer-deps`
  - Works fine, just peer dependency warning

## Files Modified

### Configuration
- package.json
- tsconfig.json (moduleResolution: bundler, lib: es2022)
- angular.json

### Code Changes
- 6 components: null safety fixes
- 1 directive: event type fix
- 1 stats component: rxResource API migration
- 12 templates: automatic control flow migration

## Next Steps

- ✅ Phase 1: Pre-Migration Assessment
- ✅ Phase 2: Core Framework Updates  
- ⏭️ Phase 3: Signal Forms Migration (ProfileComponent)
- ⏭️ Phase 4: Signal APIs Modernization
- ⏭️ Phase 5: Testing & Validation
- ⏭️ Phase 6: Documentation

## Migration Notes

- Incremental upgrade required: v19 → v20 → v21
- `--legacy-peer-deps` needed for some packages
- `--allow-dirty` and `--force` flags used during migration
- All automatic migrations completed successfully
