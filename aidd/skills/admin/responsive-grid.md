---
name: "responsive-grid-layout"
description: "Create responsive CSS Grid layout with auto-fill columns and consistent gap spacing for listing pages"
triggers: ["responsive grid", "grid layout", "listing grid", "auto-fill columns", "CSS Grid"]
tags: ["css", "grid", "responsive", "layout"]
priority: medium
scope: file
output: code
---

# Responsive Grid Layout

## Instructions

- Identify content type (members, projects, users) and minimum card width
- Create CSS Grid with auto-fill columns
- Set consistent gap spacing based on design system
- Add responsive breakpoints if needed
- Use TailwindCSS utilities or custom CSS class

## Example

**Input:** "Create a responsive grid for project cards with 3-4 columns"

**Output:** Responsive grid with auto-fill

```scss
// project-listing.component.scss
.grid-project-listing {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
```

```html
<!-- project-listing.component.html -->
<div class="grid-project-listing">
  @for (project of projects(); track project.id) {
    <app-project-card [project]="project" />
  }
</div>
```

**TailwindCSS Alternative:**

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  @for (project of projects(); track project.id) {
    <app-project-card [project]="project" />
  }
</div>
```

**Custom Grid Utilities:**

```scss
// Member listing (smaller cards)
.grid-member-listing {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

// User listing (compact cards)
.grid-user-listing {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

// Flexible grid (content-aware)
.grid-flexible {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

**Component Usage:**

```typescript
@Component({
  selector: 'app-project-listing',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './project-listing.component.html',
  styleUrl: './project-listing.component.scss'
})
export class ProjectListingComponent {
  projects = signal<Project[]>([]);

  ngOnInit() {
    this.loadProjects();
  }
}
```
