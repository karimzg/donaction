# Instruction: Logger Helper for API

## Feature

- **Summary**: Create reusable logger helper function with configurable colors and prefix, refactor request-logger middleware to use it
- **Stack**: `TypeScript 5`, `Strapi 5`, `Node.js`
- **Branch name**: `feat/logger-helper`

## Existing files

- @donaction-api/src/middlewares/request-logger.ts

### New file to create

- donaction-api/src/helpers/logger/index.ts

## Implementation phases

### Phase 1: Create Logger Helper

> Create reusable logging utility with color support

1. Create `src/helpers/logger/index.ts`
   - [ ] 1.1. Define and export COLORS constant (reset, green, blue, yellow, red, gray)
   - [ ] 1.2. Define LogEntry type: `{ key: string, value: string | number | undefined | null }`
   - [ ] 1.3. Define LogBlockParams type with statusColor, separatorColor, entries, prefix
   - [ ] 1.4. Implement `logBlock()` function:
     - Early return if entries empty
     - Print separator line with separatorColor
     - First entry: key + value both with statusColor
     - Other entries: key with statusColor, value with reset
     - Print closing separator
     - Handle null/undefined as string "undefined"

### Phase 2: Refactor Request Logger

> Use new helper in existing middleware

1. Update `src/middlewares/request-logger.ts`
   - [ ] 1.1. Import `logBlock` and `COLORS` from helpers/logger
   - [ ] 1.2. Remove local COLORS constant
   - [ ] 1.3. Replace console.log calls with single `logBlock()` call
   - [ ] 1.4. Build entries array from ctx data (METHOD, URL, STATUS, MESSAGE, ENV)

## Reviewed implementation

- [ ] Phase 1: Create Logger Helper
- [ ] Phase 2: Refactor Request Logger

## Validation flow

1. Start API dev server: `npm run develop`
2. Make any HTTP request to the API
3. Verify console output shows formatted log block with colors
4. Verify output format matches original request-logger output

## Estimations

- **Confidence**: 10/10
  - ✅ Clear requirements with existing reference implementation
  - ✅ Simple utility function, no external dependencies
  - ✅ Straightforward refactor
- **Time to implement**: ~15 minutes
