---
name: "card-component-variants"
description: "Create card component with multiple style variants (default, elevated, flat, interactive) following design system patterns"
triggers: ["card component", "card variants", "card styles", "content container", "create card", "card design", "container component", "display card"]
tags: ["component", "card", "design-system", "ui"]
priority: medium
scope: file
output: code
---

# Card Component with Variants

## Instructions

- Create base card component with standard padding, radius, shadow
- Use design system tokens: `surface-card`, `surface-border`
- Implement variants: default, elevated, flat, interactive
- Add optional header and footer sections
- Support content projection with `<ng-content>`
- Apply hover effects for interactive variant

## Example

**Input:** "Create a card component with elevated and interactive variants"

**Output:** Reusable card component with variants

```typescript
// card.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type CardVariant = 'default' | 'elevated' | 'flat' | 'interactive';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  variant = input<CardVariant>('default');
  title = input<string>();
  subtitle = input<string>();
}
```

```html
<!-- card.component.html -->
<div
  class="card"
  [class.card-elevated]="variant() === 'elevated'"
  [class.card-flat]="variant() === 'flat'"
  [class.card-interactive]="variant() === 'interactive'"
>
  @if (title() || subtitle()) {
    <header class="card-header">
      @if (title()) {
        <h3 class="card-title">{{ title() }}</h3>
      }
      @if (subtitle()) {
        <p class="card-subtitle">{{ subtitle() }}</p>
      }
    </header>
  }

  <div class="card-body">
    <ng-content></ng-content>
  </div>

  <footer class="card-footer">
    <ng-content select="[footer]"></ng-content>
  </footer>
</div>
```

```scss
// card.component.scss
.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}

.card-elevated {
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.15);
}

.card-flat {
  box-shadow: none;
}

.card-interactive {
  cursor: pointer;

  &:hover {
    box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.14);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);

  .card-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .card-subtitle {
    margin: 0.5rem 0 0;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }
}

.card-body {
  flex: 1;
}

.card-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);

  &:empty {
    display: none;
  }
}
```

**Usage Examples:**

```html
<!-- Default card -->
<app-card title="User Profile">
  <p>Card content goes here</p>
</app-card>

<!-- Elevated card with subtitle -->
<app-card
  variant="elevated"
  title="Project Details"
  subtitle="Last updated 2 hours ago"
>
  <div class="project-stats">
    <span>Tasks: 24</span>
    <span>Progress: 75%</span>
  </div>
  <div footer>
    <button pButton label="View Details"></button>
  </div>
</app-card>

<!-- Interactive card -->
<app-card
  variant="interactive"
  title="Click to expand"
  (click)="handleClick()"
>
  <p>This card is clickable</p>
</app-card>

<!-- Flat card -->
<app-card variant="flat">
  <p>Simple content without shadow</p>
</app-card>
```

**Grid of Cards:**

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  @for (item of items(); track item.id) {
    <app-card
      variant="interactive"
      [title]="item.title"
      [subtitle]="item.subtitle"
      (click)="selectItem(item)"
    >
      <p>{{ item.description }}</p>
      <div footer>
        <button pButton icon="pi pi-eye" [text]="true"></button>
        <button pButton icon="pi pi-pencil" [text]="true"></button>
      </div>
    </app-card>
  }
</div>
```
