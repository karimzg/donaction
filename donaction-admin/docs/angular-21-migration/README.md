# Angular 21 Migration

**Version**: 2.1.0
**Date**: 2025-12-19
**Status**: ✅ Complete

## Summary

Migrated from Angular 19.2.0 → 21.0.6 with modern signal-based APIs.

## Key Changes

- ✅ Signal inputs: `input()` and `input.required<T>()` replace `@Input()`
- ✅ Signal queries: `viewChild()` replaces `@ViewChild()`
- ✅ Automatic cleanup: `takeUntilDestroyed()` replaces manual `Subject/ngOnDestroy`
- ✅ Bundle size: 1.62 MB (unchanged)
- ✅ Third-party packages upgraded (ng-recaptcha → ng-recaptcha-2, etc.)
- ⏳ PrimeNG v21: Deferred (breaking changes, future PR)

## Migration Commits

1. **Phase 2B**: Third-party package upgrades
   Commit: `5f7d371`
   - Replaced ng-recaptcha with ng-recaptcha-2@21.0.1
   - Upgraded ngx-device-detector, ngx-image-cropper, ngx-lottie

2. **Phase 4**: Signal APIs modernization
   Commit: `3706967`
   - Converted 4 files: `@Input()` → `input()`
   - Converted 12 files: `@ViewChild()` → `viewChild()`
   - Converted 1 file: `takeUntil()` → `takeUntilDestroyed()`

## Documentation

- **Memory Bank**: `docs/memory-bank/admin/AGENTS.md` (updated with Angular 21 info)
- **Skills**: Updated 3 skill files in `aidd/skills/admin/`:
  - `standalone-component.md` - Added viewChild() and takeUntilDestroyed() examples
  - `reactive-form.md` - Added takeUntilDestroyed() pattern
  - `generic-update-component.md` - Updated signal query usage
- **Validation Report**: `phase5-validation-report.md` (bundle analysis)

## Quick Reference

### Signal Inputs
```typescript
// Before
@Input() title!: string;
@Input() count = 0;

// After
title = input.required<string>();
count = input<number>(0);

// Template: {{ title() }}
```

### ViewChild Queries
```typescript
// Before
@ViewChild('input') input!: ElementRef;

// After
input = viewChild.required<ElementRef>('input');

// Usage: this.input().nativeElement.focus()
```

### Subscription Cleanup
```typescript
// Before
private destroy$ = new Subject<void>();
ngOnDestroy() { this.destroy$.complete(); }

// After
.pipe(takeUntilDestroyed())
// No ngOnDestroy needed!
```

## References

- Official Angular 21 docs: https://angular.dev/guide/signals
- GitHub Issue: #13
- Branch: `epic/4-stripe-connect-migration`
