# Instruction: Phase 2: Stripe Connect Integration (Backend)

## Feature

- **Summary**: Implement Stripe Connect Express account creation, webhooks, and account management with daily sync automation
- **Stack**: `Strapi 5.13.0`, `TypeScript 5`, `Stripe API 2025-02-24.acacia`, `Next.js 14`, `Node.js cron`
- **Branch name**: `feature/6-phase-2-stripe-integration`

## Existing files

- donaction-api/src/helpers/stripe-connect-helper.ts
- donaction-api/src/api/connected-account/content-types/connected-account/schema.json
- donaction-api/src/api/webhook-log/content-types/webhook-log/schema.json
- donaction-api/src/api/klubr/content-types/klubr/schema.json
- donaction-frontend/src/core/services/club/index.ts
- donaction-frontend/src/core/services/endpoints.ts
- donaction-frontend/src/layouts/partials/authentication/newClubForm/useNewClubForm.ts

### New files to create

- donaction-api/src/api/stripe-connect/services/stripe-connect.ts
- donaction-api/src/api/stripe-connect/controllers/stripe-connect.ts
- donaction-api/src/api/stripe-connect/routes/stripe-connect.ts
- donaction-api/src/api/stripe-connect/routes/stripe-connect-custom.ts
- donaction-api/src/api/stripe-connect/middlewares/verify-webhook-signature.ts
- donaction-api/src/helpers/stripe-webhook-handlers.ts
- donaction-api/src/cron/sync-stripe-accounts.ts
- donaction-api/config/cron.ts
- donaction-frontend/src/app/api/klubr/create/route.ts

## Implementation phases

### Phase 1: Stripe Connect Service Layer

> Create comprehensive service module with all Stripe Connect operations

1. Create Stripe Connect API module structure
   - [x] Create donaction-api/src/api/stripe-connect directory
   - [x] Initialize services, controllers, routes, middlewares folders

2. Implement Stripe Connect service
   - [x] Create service with factory pattern using createCoreService
   - [x] Add createAccount method (wraps existing helper)
   - [x] Add generateOnboardingLink method (wraps existing helper)
   - [x] Add syncAccountStatus method (wraps existing helper)
   - [x] Add retrieveAccount method for fetching account details
   - [x] Add updateAccountStatus method for manual updates
   - [x] Add listAccounts method with filtering
   - [x] Type all methods with proper Stripe and entity types

3. Implement webhook event handlers
   - [x] Create stripe-webhook-handlers.ts in helpers
   - [x] Add handler for account.updated
   - [x] Add handler for account.external_account.created
   - [x] Add handler for account.external_account.updated
   - [x] Add handler for capability.updated
   - [x] Add handler for person.created
   - [x] Add handler for person.updated
   - [x] Each handler updates connected_account in database
   - [x] Each handler logs to webhook-log
   - [x] Use syncAccountStatus for account events

### Phase 2: API Routes & Controllers

> Expose Stripe Connect operations via Strapi routes and modify Next.js registration

1. Create Stripe Connect controller
   - [x] Use createCoreController factory
   - [x] Add createAccount action (POST /stripe-connect/accounts)
   - [x] Add generateOnboardingLink action (POST /stripe-connect/accounts/:accountId/onboarding-link)
   - [x] Add syncAccount action (POST /stripe-connect/accounts/:accountId/sync)
   - [x] Add getAccount action (GET /stripe-connect/accounts/:accountId)
   - [x] Add handleWebhook action (POST /stripe-connect/webhook)
   - [x] Validate and sanitize all inputs
   - [x] Add proper error handling with French messages

2. Create custom routes
   - [x] Define routes in stripe-connect-custom.ts
   - [x] Map routes to controller actions
   - [x] Add authentication middleware to account routes
   - [x] Webhook route remains public (signature verification in middleware)

3. Create webhook signature verification middleware
   - [x] Create verify-webhook-signature.ts
   - [x] Verify Stripe webhook signature using stripe.webhooks.constructEvent
   - [x] Use STRIPE_WEBHOOK_SECRET from env
   - [x] Return 400 if verification fails
   - [x] Attach verified event to ctx.state

4. Modify Next.js klubr registration
   - [x] Create donaction-frontend/src/app/api/klubr/create/route.ts
   - [x] Handle POST request with klubr data
   - [x] Call Strapi to create klubr
   - [x] Call Strapi stripe-connect/accounts endpoint to create connected account
   - [x] Generate onboarding link
   - [x] Return klubr data with onboarding URL
   - [x] Add error handling and logging

### Phase 3: Synchronization & Automation

> Implement logging, retry logic, and automated sync

1. Enhance webhook logging
   - [x] Update handleWebhook controller to log all events
   - [x] Store event_id, event_type, account_id, payload
   - [x] Mark processed=true on success, processed=false on failure
   - [x] Increment retry_count on retries
   - [x] Store error_message on failures

2. Implement webhook retry logic
   - [x] Create retry handler in stripe-webhook-handlers.ts
   - [x] Query webhook-log for processed=false and retry_count < 3
   - [x] Re-process failed events
   - [x] Update retry_count and processed status
   - [x] Log retry attempts

3. Create daily account sync cron job
   - [x] Create donaction-api/src/cron/sync-stripe-accounts.ts
   - [x] Query all connected_accounts with account_status != 'disabled'
   - [x] Call syncAccountStatus for each account
   - [x] Log sync results
   - [x] Handle errors gracefully
   - [x] Schedule for 2:00 AM daily

4. Configure cron in Strapi
   - [x] Create config/cron.ts
   - [x] Register sync-stripe-accounts task
   - [x] Set cron expression: '0 2 * * *'
   - [x] Enable cron in production only

5. Test with Stripe CLI
   - [x] Install Stripe CLI
   - [x] Run stripe listen --forward-to localhost:1437/api/stripe-connect/webhook
   - [x] Trigger account.updated event
   - [x] Verify webhook handler processes event
   - [x] Verify database updates
   - [x] Test retry logic by simulating failures
   - [x] Verify cron job execution

## Reviewed implementation

- [ ] Phase 1: Stripe Connect Service Layer
- [ ] Phase 2: API Routes & Controllers
- [ ] Phase 3: Synchronization & Automation

## Validation flow

1. Create new klubr via Next.js registration form
2. Verify connected_account created in database with stripe_account_id
3. Verify onboarding link returned to frontend
4. Open onboarding link and complete Stripe Express onboarding
5. Trigger account.updated webhook from Stripe
6. Verify webhook-log entry created with processed=true
7. Verify connected_account updated with onboarding_completed=true
8. Check account_status updated to 'active' when fully verified
9. Simulate webhook failure and verify retry logic
10. Wait for daily cron job or trigger manually
11. Verify all accounts synced with latest Stripe data

## Estimations

- **Confidence**: 9/10
  - ✅ Phase 1 infrastructure already exists (stripe-connect-helper.ts)
  - ✅ Schema already defined (connected-account)
  - ✅ Clear Strapi v5 patterns established
  - ✅ Stripe API version pinned and validated
  - ✅ Webhook signature verification is standard pattern
  - ❌ Cron configuration in Strapi 5 needs verification
  - ❌ Next.js integration point requires frontend coordination
- **Time to implement**: 2-3 days
  - Day 1: Service layer + controllers + routes
  - Day 2: Webhook handlers + middleware + Next.js integration
  - Day 3: Cron job + testing + edge cases
