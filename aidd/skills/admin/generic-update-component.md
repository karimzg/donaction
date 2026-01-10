---
name: skill:creating-crud-forms
description: Generates CRUD form components extending GenericUpdateComponent for create/update operations. Use when building entity forms in donaction-admin.
model: claude-sonnet-4-5
---

# Generic Update Component

## Instructions

- Extend `GenericUpdateComponent<T>` with entity type
- Implement required methods: `initForm()`, `formFields()`, `serviceUpdate()`, `serviceCreate()`
- Call `super()` in constructor, set entity via `this.entity.set()`
- Override message properties: `successMsg`, `errorUpdateMsg`, `errorCreateMsg`
- Use `untracked()` when reading `entitySignal` in form initialization
- Use `take(1)` with NgRx actions to prevent memory leaks
- Implement optional hooks: `updateFile()`, `cacheToUnvalidate()`, navigation redirects
- Set `routePrefix` for post-submission navigation
- Base class provides `firstInput` and `firstHeading` as signal queries (Angular 21)
- Use signal function call syntax when accessing view queries: `this.firstInput()`

## Example

- Input: "Create a member profile update form component"
- Output: Full TypeScript component with GenericUpdateComponent pattern

```typescript
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, map, take } from 'rxjs';
import { ofType } from '@ngrx/effects';
import { untracked } from '@angular/core';
import { GenericUpdateComponent } from '@shared/components/generics/generic-update/generic-update.component';
import { Member } from '@shared/utils/models/member';
import { SharedActions } from '@shared/data-access/+state/shared.actions';
import { ProfileService } from '@shared/services/profile.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-member-update',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './member-update.component.html'
})
export class MemberUpdateComponent extends GenericUpdateComponent<Member> {
  private config = inject(DynamicDialogConfig);
  private profileService = inject(ProfileService);

  protected override successMsg = 'Le profil a été mis à jour';
  protected override errorUpdateMsg = 'Le profil n\'a pas pu être modifié';
  protected override errorCreateMsg = 'Le profil n\'a pas pu être créé';
  protected override routePrefix = '/profile';

  constructor() {
    super();
    this.entity.set(this.config.data.profile);
  }

  protected override initForm(): void {
    const entity = untracked(this.entitySignal);
    this.entityForm = new FormGroup({
      nom: new FormControl(entity?.nom, Validators.required),
      prenom: new FormControl(entity?.prenom, Validators.required),
      email: new FormControl(entity?.email, [Validators.required, Validators.email]),
      role: new FormControl(entity?.role, Validators.required),
      avatar: new FormControl(entity?.avatar)
    });
  }

  protected override formFields(): { [key: string]: any } {
    return {
      ...this.entityForm.value,
      klubr: this.sharedFacade.profile()!.klubr.uuid
    };
  }

  protected override serviceUpdate(uuid: string, formValues: any): Observable<Member> {
    this.sharedFacade.updateProfile(uuid, formValues);
    return this.actions$.pipe(
      ofType(SharedActions.updateProfileSuccess),
      map(({profile}) => profile),
      take(1)
    );
  }

  protected override serviceCreate(formValues: any): Observable<Member> {
    return this.profileService.createProfile(formValues).pipe(
      map((response) => response.data as Member)
    );
  }

  protected override getEntityForCreateMode(member: Member | null): Member | null {
    return {
      uuid: '',
      nom: '',
      prenom: '',
      email: '',
      role: 'KlubMember',
      klubr: untracked(this.sharedFacade.profile)!.klubr
    };
  }

  protected override updateFile(member: Member): Observable<Member> {
    if (this.entityForm.get('avatar')?.dirty && this.entityForm.get('avatar')?.value) {
      const formData = new FormData();
      formData.append('avatar', this.entityForm.get('avatar')!.value);
      return this.profileService.uploadAvatar(member.uuid, formData);
    }
    return of(member);
  }

  protected override cacheToUnvalidate(entity: Member): void {
    this.invalidateCacheService.invalidate(['profiles', `profile-${entity.uuid}`]);
  }

  protected override pathsToUnvalidateDataRequest(entity: Member): string[] {
    return [
      `/profiles/${entity.uuid}`,
      `/klubr/${entity.klubr.slug}/members`
    ];
  }
}
```

## Template Example

```html
<form [formGroup]="entityForm" (ngSubmit)="onSubmit()">
  <div class="field">
    <label for="nom">Nom *</label>
    <input
      pInputText
      id="nom"
      formControlName="nom"
      [class.ng-invalid]="(entityForm | formControl:'nom')?.invalid && (isSubmitted() || (entityForm | formControl:'nom')?.dirty)"
    />
    <app-error-display [control]="entityForm | formControl:'nom'" [isSubmitted]="isSubmitted()"></app-error-display>
  </div>

  <div class="field">
    <label for="prenom">Prénom *</label>
    <input
      pInputText
      id="prenom"
      formControlName="prenom"
      [class.ng-invalid]="(entityForm | formControl:'prenom')?.invalid && (isSubmitted() || (entityForm | formControl:'prenom')?.dirty)"
    />
    <app-error-display [control]="entityForm | formControl:'prenom'" [isSubmitted]="isSubmitted()"></app-error-display>
  </div>

  <div class="field">
    <label for="email">Email *</label>
    <input
      pInputText
      id="email"
      type="email"
      formControlName="email"
      [class.ng-invalid]="(entityForm | formControl:'email')?.invalid && (isSubmitted() || (entityForm | formControl:'email')?.dirty)"
    />
    <app-error-display [control]="entityForm | formControl:'email'" [isSubmitted]="isSubmitted()"></app-error-display>
  </div>

  <button
    pButton
    type="submit"
    [label]="editMode ? 'Mettre à jour' : 'Créer'"
    [loading]="loading()"
    [disabled]="!isReady()"
  ></button>
</form>
```

## Optional Hooks

```typescript
// Use view queries from base class (Angular 21 signals)
override ngAfterViewInit(): void {
  super.ngAfterViewInit();

  // firstInput and firstHeading are signal queries
  if (this.firstInput()?.nativeElement) {
    this.firstInput()!.nativeElement.focus();
  }

  if (this.firstHeading()?.nativeElement) {
    const title = this.firstHeading()!.nativeElement.textContent;
    console.log('Form title:', title);
  }
}

// Pre-submission data transformation
protected override preUpdateHook(formValues: any): any {
  return {
    ...formValues,
    updatedAt: new Date().toISOString()
  };
}

// Custom navigation after create
protected override redirectAfterCreate(entity: Member): void {
  this.router.navigate(['/profiles', entity.uuid, 'settings']);
}

// Reload entity to get Strapi components
protected override reloadEntity(entity: Member): Observable<Member> {
  return this.profileService.getProfile(entity.uuid);
}
```
