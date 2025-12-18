# Admin Forms Reference

## Custom Validators

Located in `@shared/utils/validators/`:

| Validator | Purpose |
|-----------|---------|
| `passwordStrengthValidator()` | Min 8 chars, digit, special, lower/upper |
| `passwordMatchValidator` | Compare password fields |
| `differentPasswordValidator` | New ≠ current password |
| `minHtmlLengthValidator(n)` | HTML content min length |
| `maxHtmlLengthValidator(n)` | HTML content max length |
| `hexColorValidator()` | Hex color format |
| `webSiteValidator()` | URL format (http/https) |
| `dateAtLeastTomorrowValidator()` | Future date validation |
| `warn(validator)` | Convert error to warning |

## Form Pipes

| Pipe | Usage |
|------|-------|
| `FormControlPipe` | `form \| formControl:'fieldName'` |
| `FormArrayPipe` | `form \| formArray:'items'` |
| `FormStatusPipe` | Access form status |

## GenericUpdateComponent

**Location**: `@shared/components/generics/generic-update/generic-update.component.ts`

### Required Methods
```typescript
initForm(): void           // Initialize FormGroup
formFields(): object       // Return form values for API
serviceUpdate(uuid, data)  // Update API call → Observable
serviceCreate(data)        // Create API call → Observable
```

### Optional Hooks
```typescript
preUpdateHook(): void              // Before update
preCreateHook(): void              // Before create
updateFile(uuid): Observable       // File upload
cacheToUnvalidate(): string[]      // Cache tags to clear
redirectAfterCreate(): string      // Navigation path
redirectAfterUpdate(): string      // Navigation path
reloadEntity(): void               // Refresh data
```

### Properties
- `successMsg`, `errorUpdateMsg`, `errorCreateMsg` - Toast messages
- `routePrefix` - Base route for navigation
- `isSubmitted`, `loading`, `isReady` - State signals
- `entitySignal` - Current entity data

### Usage Pattern
```typescript
export class MemberUpdateComponent extends GenericUpdateComponent<Member> {
  protected override successMsg = 'Profil mis à jour';
  protected override routePrefix = '/profile';

  constructor() {
    super();
    this.entity.set(this.config.data.profile);
  }

  protected override initForm(): void {
    const entity = untracked(this.entitySignal);
    this.entityForm = new FormGroup({
      nom: new FormControl(entity?.nom, Validators.required)
    });
  }

  protected override formFields() {
    return { ...this.entityForm.value };
  }

  protected override serviceUpdate(uuid: string, data: any) {
    this.sharedFacade.updateProfile(uuid, data);
    return this.actions$.pipe(
      ofType(SharedActions.updateProfileSuccess),
      map(({ profile }) => profile),
      take(1)
    );
  }

  protected override serviceCreate(data: any) {
    return this.profileService.createProfile(data)
      .pipe(map(res => res.data as Member));
  }
}
```

## Error Display

Use `ErrorDisplayComponent` with form controls:
```html
<app-error-display [control]="form | formControl:'email'" />
```

Shows errors when control is dirty OR form submitted.
