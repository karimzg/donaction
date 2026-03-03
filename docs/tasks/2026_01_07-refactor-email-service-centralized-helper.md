# Instruction: Refactor Email Services to Use Centralized Helper

## Feature

- **Summary**: Centralize admin email sending through typed `sendEmailViaStrapiProvider()` helper with configurable admin recipients via environment variables
- **Stack**: `Strapi 5`, `TypeScript 5`
- **Branch name**: `refactor/email-service-centralized-helper`

## Existing files

- @donaction-api/src/helpers/emails/emailService.ts
- @donaction-api/src/helpers/logger/index.ts
- @donaction-api/src/api/newsletter/services/newsletter.ts
- @donaction-api/src/api/contact/services/contact.ts

### New file to create

- None

## Implementation phases

### Phase 1: Type Definition & Configuration

> Define EmailPayload type and admin email env vars

1. Create EmailPayload interface in emailService.ts
   - [ ] 1.1. Define required fields: to, from, html, subject
   - [ ] 1.2. Define optional fields: cc, bcc, replyTo, attachments, tags, destIsAdmin
2. Add admin email constants with env fallbacks
   - [ ] 2.1. ADMIN_EMAIL_PRIMARY from process.env with fallback 'hello@donaction.fr'
   - [ ] 2.2. ADMIN_EMAIL_BCC from process.env with fallback 'k.zgoulli@gmail.com'

### Phase 2: Add Logger Helper

> Add logSimple() method for beautiful single-line logs

1. Create logSimple() in logger/index.ts
   - [ ] 1.1. Accept message, emoji, and color params
   - [ ] 1.2. Format with prefix, emoji, and colored message
   - [ ] 1.3. Export function

### Phase 3: Refactor Email Helper

> Update sendEmailViaStrapiProvider to handle all params and destIsAdmin

1. Refactor sendEmailViaStrapiProvider function signature
   - [ ] 1.1. Accept typed EmailPayload parameter
   - [ ] 1.2. Export function for external use
2. Implement destIsAdmin logic
   - [ ] 2.1. When destIsAdmin=true, append ADMIN_EMAIL_PRIMARY to 'to' field
   - [ ] 2.2. When destIsAdmin=true, append ADMIN_EMAIL_BCC to 'bcc' field
3. Handle all optional fields
   - [ ] 3.1. Pass cc, replyTo, attachments to emailService.send()
4. Add logging
   - [ ] 4.1. Import logSimple from logger
   - [ ] 4.2. Log email sent with emoji and recipient info

### Phase 4: Update Consumer Services

> Migrate newsletter and contact services to use centralized helper

1. Update newsletter service
   - [ ] 1.1. Import sendEmailViaStrapiProvider from helpers
   - [ ] 1.2. Replace direct email service call with helper using destIsAdmin: true
   - [ ] 1.3. Remove hardcoded admin addresses
2. Update contact service
   - [ ] 2.1. Import sendEmailViaStrapiProvider from helpers
   - [ ] 2.2. Replace direct email service call with helper using destIsAdmin: true
   - [ ] 2.3. Remove hardcoded admin addresses

## Reviewed implementation

<!-- That section is filled by a review agent that ensures feature has been properly implemented -->

- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4

## Validation flow

<!-- What would a REAL user do to 100% validate the feature? -->

1. Set ADMIN_EMAIL_PRIMARY and ADMIN_EMAIL_BCC env vars (or use fallbacks)
2. Submit newsletter subscription form
3. Verify email received at both admin addresses
4. Submit contact form with message
5. Verify email received at both admin addresses with correct content

## Estimations

- **Confidence**: 10/10
  - ✅ Simple refactor with clear scope
  - ✅ No breaking changes to external APIs
  - ✅ All files already exist and understood
  - ✅ Strapi email plugin API is straightforward
- **Time to implement**: ~35 minutes
