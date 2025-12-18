# Admin Skills

## Overview

Skills for Angular 19 admin dashboard development. These patterns follow Angular's latest standalone components, signals API, and modern reactive patterns.

## Skills List

| Skill | Description |
|-------|-------------|
| `standalone-component.md` | Standalone component setup with inject() DI |
| `reactive-form.md` | FormGroup, FormControl, validators pattern |
| `ngrx-feature-state.md` | NgRx feature state with signals and facades |
| `generic-update-component.md` | Base CRUD form component pattern |
| `functional-guard.md` | Modern CanActivateFn route guards |
| `accessible-form.md` | ARIA labels, keyboard navigation, a11y |
| `primeng-component.md` | PrimeNG component integration |
| `http-service.md` | HTTP communication with interceptors |
| `rxjs-data-pipeline.md` | Observable pipelines with takeUntilDestroyed |
| `card-variants.md` | Reusable card component patterns |
| `responsive-grid.md` | PrimeFlex responsive grid layouts |

## Architecture

All admin skills follow these core principles:

- **Standalone components**: No NgModules, explicit imports
- **Signals API**: `signal()`, `computed()`, `effect()`, `input()`, `model()`
- **Modern control flow**: `@if`, `@for`, `@switch` instead of structural directives
- **Inject function**: DI via `inject()` instead of constructor injection
- **Facade pattern**: Components interact with facades, not services directly
- **Type safety**: Strict TypeScript, proper typing for all entities

## Common Patterns

### Component Creation
Use `standalone-component.md` for basic setup, then extend with:
- Forms → `reactive-form.md`
- CRUD operations → `generic-update-component.md`
- State management → `ngrx-feature-state.md`
- Accessibility → `accessible-form.md`

### State Flow
```
User Action → Component → Facade → Effects → Service → API
                ↑                              ↓
           Selector ← Store ← Reducer ← Action
```

## Reference Documentation

See `/docs/memory-bank/admin/AGENTS.md` for:
- Full architecture rules
- Anti-patterns to avoid
- Key file locations
- Reference documents

## Naming Conventions

See `/docs/rules/admin/naming-conventions.md` for:
- File naming: `kebab-case.suffix.ts`
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_CASE`

## Maintenance

### Keeping Skills Current

1. **Monitor Angular updates**: When Angular releases new patterns, update affected skills
2. **Validate examples**: Ensure code examples compile and follow latest best practices
3. **Sync with AGENTS.md**: Keep skills aligned with `/docs/memory-bank/admin/AGENTS.md` rules
4. **Add new patterns**: Use `/ide:01_onboard:generate_skill` to create skills for emerging patterns
