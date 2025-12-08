# Testing Guidelines

Testing strategy and configuration for donaction-saas module.

## Tools and Frameworks

- **Test Runner**: Vitest 2
- **Test Environment**: Node (via Vite)
- **Config**: Uses @vite.config.ts (no separate vitest config)
- **Mocking**: Vitest native mocks (`vi.mock`, `vi.fn`, `vi.stubGlobal`)

## Test Execution Process

- **Run tests**: `npm test`
- **Single test file**: `vitest run path/to/test.test.ts`
- **Watch mode**: `vitest` (default behavior)

## Testing Strategy

- **Current Status**: Minimal test coverage
- **Test Location**: `__tests__` directories alongside components
- **File Pattern**: `*.test.ts`
- **Focus**: Component initialization and API integration

## Test Patterns

### File Structure
- Tests in `__tests__` subdirectories
- Example: @donaction-saas/src/components/sponsorshipForm/__tests__/initComponent.test.ts

### Common Patterns
- Mock external dependencies (`Fetch`, `document.querySelectorAll`)
- Use `beforeEach` for setup, `afterEach` for cleanup
- Mock environment variables via `import.meta.env`
- Mock DOM APIs with `vi.stubGlobal`

### Test Organization
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle success case', async () => {
    // arrange, act, assert
  });

  it('should handle error case', async () => {
    await expect(fn()).rejects.toThrow('error');
  });
});
```

## Mocking and Stubbing

- **API Mocking**: Mock `Fetch` utility for API calls
- **DOM Mocking**: Use `vi.stubGlobal` for global objects (`document`, `window`)
- **Module Mocking**: Use `vi.mock()` for external modules
- **Environment**: Mock `import.meta.env` for environment variables
