---
name: "angular-standalone-component"
description: "Create Angular 21 standalone component with signals, modern control flow, viewChild queries, and dependency injection via inject()"
triggers: ["create component", "standalone component", "Angular component", "signals", "new component", "generate component"]
tags: ["angular", "typescript", "component", "signals"]
priority: high
scope: file
output: code
---

# Angular Standalone Component with Signals

## Instructions

- Identify component name, selector, and required inputs from user request
- Generate standalone component with `standalone: true` and explicit imports array
- Use `signal()` for local state, `input()` for component inputs, `computed()` for derived values
- Use `viewChild()` for view queries (replaces `@ViewChild()`)
- Use `inject()` function for dependency injection (no constructor injection)
- Use `takeUntilDestroyed()` for automatic subscription cleanup
- Apply modern control flow syntax (`@if`, `@for`, `@switch`) in template
- Include PrimeNG components in imports if UI elements needed
- Follow naming convention: `*.component.ts` with `app-` selector prefix
- Add SCSS file with `styleUrl` if styling required

## Example

**Input:** "Create a user profile component that displays user name and email with edit mode"

**Output:** Component with signals for state management and modern Angular syntax

```typescript
// user-profile.component.ts
import { Component, signal, computed, input, viewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  private userService = inject(UserService);

  // Inputs
  userId = input.required<string>();

  // View queries (Angular 21)
  emailInput = viewChild<ElementRef>('emailInput');

  // Local state
  isEditMode = signal(false);
  user = signal<User | null>(null);

  // Computed values
  displayName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : 'Unknown';
  });

  ngOnInit() {
    // Automatic cleanup with takeUntilDestroyed
    this.userService.getUser(this.userId())
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user));
  }

  toggleEditMode() {
    this.isEditMode.update(mode => !mode);

    // Focus input when entering edit mode
    if (this.isEditMode() && this.emailInput()?.nativeElement) {
      setTimeout(() => this.emailInput()!.nativeElement.focus(), 0);
    }
  }

  saveProfile() {
    const user = this.user();
    if (user) {
      this.userService.updateUser(user.id, user)
        .pipe(takeUntilDestroyed())
        .subscribe(() => {
          this.isEditMode.set(false);
        });
    }
  }
}
```

```html
<!-- user-profile.component.html -->
<div class="profile-card">
  @if (user(); as user) {
    <h2>{{ displayName() }}</h2>

    @if (isEditMode()) {
      <input
        #emailInput
        pInputText
        [(ngModel)]="user.email"
        placeholder="Email"
      />
      <button pButton label="Save" (click)="saveProfile()"></button>
      <button pButton label="Cancel" (click)="toggleEditMode()"></button>
    } @else {
      <p>{{ user.email }}</p>
      <button pButton label="Edit" (click)="toggleEditMode()"></button>
    }
  } @else {
    <p>Loading...</p>
  }
</div>
```

```scss
// user-profile.component.scss
.profile-card {
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```
