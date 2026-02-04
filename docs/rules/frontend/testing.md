# Frontend Testing Guide

## Stack

- **Test Runner**: Vitest 2.x
- **Testing Library**: React Testing Library
- **Environment**: jsdom

## Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests in watch mode |
| `npm run test:ci` | Run tests once (CI) |
| `npm run test:coverage` | Run with coverage report |
| `npm run test:ui` | Open Vitest UI |

## File Naming

- **Convention**: `ComponentName.test.tsx`
- **Location**: Same directory as component

```
NewHpHero/
├── index.tsx
├── index.scss
└── NewHpHero.test.tsx  ✅
```

## Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MyComponent from './index';

// Mocks at top level
vi.mock('next/link', () => ({...}));

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
```

## Best Practices

### Queries Priority

1. `getByRole` - accessibility-first ✅
2. `getByLabelText` - form elements
3. `getByText` - visible text
4. `getByTestId` - last resort

### Mocking Next.js

```typescript
// next/link
vi.mock('next/link', () => ({
  default: ({ children, href, className }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

// next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/test',
}));
```

### Test Isolation

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Avoid Brittle Tests

```typescript
// ❌ Brittle - breaks with i18n
expect(heading).toHaveTextContent('Welcome to our site');

// ✅ Robust - tests structure
expect(heading).toBeInTheDocument();
expect(heading.textContent).toBeTruthy();
```

## Coverage

Run `npm run test:coverage` to generate reports.

**Target**: 80% (thresholds to be enabled when coverage is meaningful)

## CI Integration

Tests run automatically on PR when frontend files change.
Coverage reports uploaded as artifacts.
