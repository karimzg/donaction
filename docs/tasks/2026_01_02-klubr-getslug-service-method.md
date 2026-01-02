# Instruction: Create getSlug Service Method for Klubr

## Feature

- **Summary**: Extract slug generation logic from controller to service with collision handling (max 3 attempts)
- **Stack**: `Strapi 5`, `TypeScript 5`
- **Branch name**: `feat/issue-9` (current)

## Existing files

- @donaction-api/src/api/klubr/services/klubr.ts
- @donaction-api/src/api/klubr/controllers/klubr.ts
- @donaction-api/src/helpers/string.ts

### New file to create

- None

## Implementation phases

### Phase 1: Create getSlug service method

> Add reusable slug generation with collision detection

1. Add `getSlug` method to klubr service
   - [ ] 1.1. Import `slugify` from `../../../helpers/string`
   - [ ] 1.2. Create async method `getSlug(denomination: string): Promise<string>`
   - [ ] 1.3. Generate base slug using `slugify(denomination)`
   - [ ] 1.4. Check DB for existing slug using `strapi.db.query`
   - [ ] 1.5. If collision: try `-2`, `-3` suffixes (loop)
   - [ ] 1.6. After 3 failed attempts: throw error
   - [ ] 1.7. Return unique slug

### Phase 2: Integrate in controller

> Replace inline logic with service call

1. Update `createKlubrByMember` controller method
   - [ ] 1.1. Remove inline slug logic (lines 1040-1053)
   - [ ] 1.2. Call `strapi.service('api::klubr.klubr').getSlug(denomination)`
   - [ ] 1.3. Assign returned slug to `ctx.request.body.data.slug`
   - [ ] 1.4. Handle error from service (return badRequest)

## Reviewed implementation

- [x] Phase 1
- [x] Phase 2

## Validation flow

1. Create new klubr with unique denomination → slug generated
2. Create klubr with same denomination → slug gets `-2` suffix
3. Create 3rd klubr with same denomination → slug gets `-3` suffix
4. Create 4th klubr with same denomination → error returned

## Estimations

- **Confidence**: 10/10
  - ✅ Simple refactoring, clear requirements
  - ✅ Existing patterns in codebase
  - ✅ No external dependencies
- **Time to implement**: ~15 minutes
