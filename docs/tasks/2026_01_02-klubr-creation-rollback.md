# Instruction: Rollback & Error Handling for createKlubrByMember()

## Feature

- **Summary**: Add transaction-like rollback on entity creation/update failure, proper email error handling with admin notification, and frontend warning display
- **Stack**: `Strapi 5`, `TypeScript 5`, `Next.js 14`
- **Branch name**: `feat/klubr-creation-rollback`

## Existing files

- @donaction-api/src/api/klubr/controllers/klubr.ts
- @donaction-api/src/helpers/emails/sendBrevoTransacEmail.ts
- @donaction-frontend/src/layouts/partials/authentication/newClubForm/useNewClubForm.ts
- @donaction-frontend/src/core/services/club/index.ts

### New file to create

- None

## Implementation phases

### Phase 1: Backend - Rollback Helper

> Create reusable rollback mechanism for created entities

1. Add type for tracked entity
   - [ ] 1.1. Define `CreatedEntity` type: `{ uid: string, documentId: string }`
2. Create `rollbackCreatedEntities()` helper function
   - [ ] 2.1. Accept array of `CreatedEntity`
   - [ ] 2.2. Delete entities in reverse order using Document Service API
   - [ ] 2.3. Log each deletion for debugging
   - [ ] 2.4. Wrap in try-catch to prevent rollback failures from breaking

### Phase 2: Backend - Wrap Operations with Rollback

> Modify createKlubrByMember to track and rollback on failure

1. Initialize tracking array at start of method
   - [ ] 1.1. `const createdEntities: CreatedEntity[] = []`
2. Wrap CREATE klubr
   - [ ] 2.1. Push to tracking array after success
   - [ ] 2.2. On failure: return error (nothing to rollback yet)
3. Wrap CREATE klubr-house
   - [ ] 3.1. Push to tracking array after success
   - [ ] 3.2. On failure: rollback + return error
4. Wrap CREATE klubr-info
   - [ ] 4.1. Push to tracking array after success
   - [ ] 4.2. On failure: rollback + return error
5. Wrap CREATE klubr-document
   - [ ] 5.1. Push to tracking array after success
   - [ ] 5.2. On failure: rollback + return error
6. Wrap UPDATE klubr-house
   - [ ] 6.1. On failure: rollback + return error
7. Wrap UPDATE klubr-membre
   - [ ] 7.1. On failure: rollback + return error

### Phase 3: Backend - Email Error Handling & Response

> Handle email failure gracefully without rollback

1. Wrap sendClubCreationEmail in try-catch
   - [ ] 1.1. Catch email failure separately from creation
   - [ ] 1.2. Log error for debugging
2. Send admin alert on email failure
   - [ ] 2.1. Use sendBrevoTransacEmail to notify super admin
   - [ ] 2.2. Include club name, member email, error details
3. Modify return response
   - [ ] 3.1. Return `{ ...entity, emailSent: true }` on full success
   - [ ] 3.2. Return `{ ...entity, emailSent: false }` on email failure

### Phase 4: Frontend - Handle emailSent Flag

> Display appropriate message based on emailSent status

1. Update createKlubrByMember response handling
   - [ ] 1.1. Check `res.emailSent` value
2. Handle emailSent: false case
   - [ ] 2.1. Show toast warning: "Club created but confirmation email failed"
   - [ ] 2.2. Continue redirect to congratulations page
3. Handle emailSent: true (default)
   - [ ] 3.1. Normal flow (no change needed)

## Reviewed implementation

- [x] Phase 1
- [x] Phase 2
- [x] Phase 3
- [x] Phase 4

## Validation flow

1. Create a new club via the form
2. Verify all entities created (klubr, klubr-house, klubr-info, klubr-document)
3. Simulate creation failure (e.g., invalid data) → verify rollback deletes all created entities
4. Simulate email failure → verify club exists, admin notified, frontend shows warning
5. Normal success → verify email sent, no warning displayed

## Estimations

- **Confidence**: 9/10
  - ✅ Clear requirements and existing code structure
  - ✅ Strapi Document Service API well documented for delete operations
  - ✅ Email service already exists and proven
  - ❌ Minor risk: Need to verify correct documentId available after each creation
- **Time to implement**: ~2-3 hours
