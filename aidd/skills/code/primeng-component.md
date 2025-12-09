---
name: "primeng-styled-component"
description: "Create Angular component styled with PrimeNG components, TailwindCSS utilities, and custom SCSS"
triggers: ["PrimeNG component", "styled component", "UI component", "PrimeNG table", "PrimeNG dialog"]
tags: ["angular", "primeng", "tailwind", "scss", "ui"]
priority: medium
scope: file
output: code
---

# PrimeNG Styled Component

## Instructions

- Identify required PrimeNG components from user request (Table, Dialog, Button, etc.)
- Import PrimeNG modules in component's `imports` array
- Use TailwindCSS utilities for layout and spacing
- Add custom SCSS for component-specific styling
- Follow PrimeNG v19 syntax and patterns
- Use PrimeFlex utilities for responsive layout
- Apply theme colors from @donaction-admin/src/app/shared/utils/theme/theme.preset.ts

## Example

**Input:** "Create a data table component with filtering, pagination, and action buttons"

**Output:** Component using PrimeNG Table with styling

```typescript
// user-table.component.ts
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { UserService } from '@shared/services/user.service';
import { User } from '@shared/utils/models/user-details';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TagModule
  ],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss'
})
export class UserTableComponent {
  private userService = inject(UserService);

  users = signal<User[]>([]);
  loading = signal(true);
  totalRecords = signal(0);
  selectedUsers = signal<User[]>([]);
  displayDialog = signal(false);
  selectedUser = signal<User | null>(null);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(event?: any) {
    this.loading.set(true);
    const page = event?.first ? Math.floor(event.first / event.rows) + 1 : 1;
    const pageSize = event?.rows || 10;

    this.userService.getUsers({ page, pageSize }).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.totalRecords.set(response.meta.pagination.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  viewUser(user: User) {
    this.selectedUser.set(user);
    this.displayDialog.set(true);
  }

  deleteUser(user: User) {
    if (confirm(`Delete user ${user.username}?`)) {
      this.userService.deleteUser(user.id).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'pending': return 'warn';
      default: return 'info';
    }
  }
}
```

```html
<!-- user-table.component.html -->
<div class="card">
  <p-table
    [value]="users()"
    [lazy]="true"
    [paginator]="true"
    [rows]="10"
    [totalRecords]="totalRecords()"
    [loading]="loading()"
    [rowsPerPageOptions]="[10, 25, 50]"
    [showCurrentPageReport]="true"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
    [(selection)]="selectedUsers"
    (onLazyLoad)="loadUsers($event)"
    dataKey="id"
    styleClass="p-datatable-striped"
  >
    <ng-template pTemplate="caption">
      <div class="flex justify-content-between align-items-center">
        <h2 class="m-0">Users</h2>
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input
            pInputText
            type="text"
            placeholder="Search users..."
            class="w-full"
          />
        </span>
      </div>
    </ng-template>

    <ng-template pTemplate="header">
      <tr>
        <th style="width: 4rem">
          <p-tableHeaderCheckbox />
        </th>
        <th pSortableColumn="username">
          Username <p-sortIcon field="username" />
        </th>
        <th pSortableColumn="email">
          Email <p-sortIcon field="email" />
        </th>
        <th pSortableColumn="role">
          Role <p-sortIcon field="role" />
        </th>
        <th>Status</th>
        <th style="width: 10rem">Actions</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-user>
      <tr>
        <td>
          <p-tableCheckbox [value]="user" />
        </td>
        <td>{{ user.username }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.role }}</td>
        <td>
          <p-tag
            [value]="user.status"
            [severity]="getSeverity(user.status)"
          />
        </td>
        <td>
          <div class="flex gap-2">
            <p-button
              icon="pi pi-eye"
              [rounded]="true"
              [text]="true"
              severity="info"
              (onClick)="viewUser(user)"
            />
            <p-button
              icon="pi pi-trash"
              [rounded]="true"
              [text]="true"
              severity="danger"
              (onClick)="deleteUser(user)"
            />
          </div>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="6" class="text-center">No users found.</td>
      </tr>
    </ng-template>
  </p-table>
</div>

<!-- User Details Dialog -->
<p-dialog
  [header]="'User Details'"
  [(visible)]="displayDialog"
  [modal]="true"
  [style]="{ width: '450px' }"
>
  @if (selectedUser(); as user) {
    <div class="flex flex-column gap-3">
      <div>
        <label class="font-semibold">Username:</label>
        <p>{{ user.username }}</p>
      </div>
      <div>
        <label class="font-semibold">Email:</label>
        <p>{{ user.email }}</p>
      </div>
      <div>
        <label class="font-semibold">Role:</label>
        <p>{{ user.role }}</p>
      </div>
      <div>
        <label class="font-semibold">Status:</label>
        <p-tag [value]="user.status" [severity]="getSeverity(user.status)" />
      </div>
    </div>
  }
</p-dialog>
```

```scss
// user-table.component.scss
.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.12);
}

:host ::ng-deep {
  .p-datatable {
    .p-datatable-header {
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }

    .p-datatable-thead > tr > th {
      background-color: var(--surface-100);
      font-weight: 600;
    }

    .p-datatable-tbody > tr:hover {
      background-color: var(--surface-50);
    }
  }

  .p-dialog .p-dialog-header {
    background-color: var(--primary-color);
    color: var(--primary-color-text);
  }
}
```
