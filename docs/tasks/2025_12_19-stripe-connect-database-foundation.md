---
name: plan
description: Feature implementation plan template
argument-hint: N/A
---

# Instruction: Phase 1: Database & Backend Foundation

## Feature

- **Summary**: Setup Stripe Connect infrastructure with new database schema, Strapi content types for connected accounts, webhook logs, financial audit tracking, and receipt cancellations
- **Stack**: `Strapi 5.13.0`, `TypeScript 5`, `PostgreSQL`, `Stripe SDK 17.6.0`
- **Branch name**: `feature/4-phase-1-database-foundation`

## Existing files

- @donaction-api/src/api/klubr/content-types/klubr/schema.json
- @donaction-api/src/api/klubr-document/content-types/klubr-document/schema.json
- @donaction-api/src/api/trade-policy/content-types/trade-policy/schema.json
- @donaction-api/src/api/klub-don-payment/content-types/klub-don-payment/schema.json
- @donaction-api/package.json
- @donaction-api/src/helpers/

### New files to create

- donaction-api/src/api/connected-account/content-types/connected-account/schema.json
- donaction-api/src/api/webhook-log/content-types/webhook-log/schema.json
- donaction-api/src/api/financial-audit-log/content-types/financial-audit-log/schema.json
- donaction-api/src/api/receipt-cancellation/content-types/receipt-cancellation/schema.json
- donaction-api/src/helpers/stripe-connect-helper.ts

## Implementation phases

### Phase 1: Create New Content Types

> Setup 4 new Strapi content types with proper schema definitions and field validations

1. Create connected-account content type
   - [ ] Create directory structure: `src/api/connected-account/content-types/connected-account/`
   - [ ] Define schema.json with fields: stripe_account_id (unique string), klubr (relation), account_status (enum: pending/active/restricted/disabled), capabilities (json), verification_status (enum: unverified/pending/verified/rejected), onboarding_completed (boolean), business_type (enum: individual/company/non_profit), country (string, default: FR), created_at_stripe (datetime), last_sync (datetime), requirements (json), uuid (custom UUID)
   - [ ] Set collectionName: "connected_accounts"
   - [ ] Disable draftAndPublish

2. Create webhook-log content type
   - [ ] Create directory structure: `src/api/webhook-log/content-types/webhook-log/`
   - [ ] Define schema.json with fields: event_id (unique string), event_type (string), account_id (string), payload (json), processed (boolean default false), error_message (text), retry_count (integer default 0), processed_at (datetime), uuid (custom UUID)
   - [ ] Set collectionName: "webhook_logs"
   - [ ] Disable draftAndPublish

3. Create financial-audit-log content type
   - [ ] Create directory structure: `src/api/financial-audit-log/content-types/financial-audit-log/`
   - [ ] Define schema.json with fields: action_type (enum: transfer_created/payout_initiated/refund_processed/fee_calculated), klubr (relation), klub_don (relation), amount (decimal), currency (string default EUR), stripe_object_id (string), metadata (json), performed_by (relation to users-permissions user), performed_at (datetime), uuid (custom UUID)
   - [ ] Set collectionName: "financial_audit_logs"
   - [ ] Disable draftAndPublish

4. Create receipt-cancellation content type
   - [ ] Create directory structure: `src/api/receipt-cancellation/content-types/receipt-cancellation/`
   - [ ] Define schema.json with fields: original_donation (relation to klub-don), cancellation_reason (enumeration: donor_request/duplicate/error/fraud/other), status (enumeration: pending/approved/rejected/completed), requested_by (relation to users-permissions user), requested_at (datetime), processed_by (relation to users-permissions user), processed_at (datetime), notes (text), refund_amount (decimal), refund_stripe_id (string), uuid (custom UUID)
   - [ ] Set collectionName: "receipt_cancellations"
   - [ ] Disable draftAndPublish

### Phase 2: Modify Existing Content Types

> Update klubr, klubr-document, trade-policy, and klub-don-payment schemas with new Stripe Connect fields

1. Update klubr schema
   - [ ] Open `src/api/klubr/content-types/klubr/schema.json`
   - [ ] Add relation: connected_account (oneToOne to api::connected-account.connected-account)

2. Update klubr-document schema
   - [ ] Open `src/api/klubr-document/content-types/klubr-document/schema.json`
   - [ ] Add field: managerSignature (json type, following pattern of other document fields)
   - [ ] Add field: managerSignatureValide (boolean)

3. Update trade-policy schema
   - [ ] Open `src/api/trade-policy/content-types/trade-policy/schema.json`
   - [ ] Add field: fee_model (enumeration: percentage_only/fixed_only/percentage_plus_fixed, default: percentage_only)
   - [ ] Add field: fixed_amount (decimal, default: 0)
   - [ ] Add field: donor_pays_fee (boolean, default: false)

4. Update klub-don-payment schema
   - [ ] Open `src/api/klub-don-payment/content-types/klub-don-payment/schema.json`
   - [ ] Add field: idempotency_key (string, unique)
   - [ ] Add field: refund_status (enumeration: none/pending/partial/full, default: none)
   - [ ] Add field: platform_fee_amount (decimal)
   - [ ] Add field: application_fee_amount (decimal)
   - [ ] Note: payment_intent_id already exists as intent_id field

### Phase 3: Stripe Connect Helper Utilities

> Create reusable helper functions for Stripe Connect operations

1. Create stripe-connect-helper.ts
   - [ ] Create file: `src/helpers/stripe-connect-helper.ts`
   - [ ] Import Stripe SDK (already at v17.6.0)
   - [ ] Add function: `createConnectedAccount(klubrId, businessType, country)` - creates Stripe connected account
   - [ ] Add function: `generateAccountLink(accountId, refreshUrl, returnUrl)` - generates onboarding link
   - [ ] Add function: `syncAccountStatus(accountId)` - fetches and syncs account capabilities and verification
   - [ ] Add function: `calculateApplicationFee(amount, tradePolicy)` - calculates platform fee based on fee_model
   - [ ] Add function: `createTransferToConnectedAccount(amount, accountId, metadata)` - creates transfer
   - [ ] Add function: `logFinancialAction(actionType, klubrId, klubDonId, amount, stripeObjectId, metadata)` - creates audit log entry
   - [ ] Add TypeScript types for all functions
   - [ ] Export all functions

### Phase 4: Validation

> Verify schema changes and test Strapi admin interface

1. Restart Strapi and validate auto-migration
   - [ ] Run: `npm run develop` in donaction-api
   - [ ] Verify Strapi starts without errors
   - [ ] Check console for successful schema migrations
   - [ ] Verify database tables created: connected_accounts, webhook_logs, financial_audit_logs, receipt_cancellations
   - [ ] Verify existing tables modified correctly

2. Test Strapi admin interface
   - [ ] Login to Strapi admin panel
   - [ ] Navigate to Content Manager
   - [ ] Verify "Connected Account" collection type visible
   - [ ] Verify "Webhook Log" collection type visible
   - [ ] Verify "Financial Audit Log" collection type visible
   - [ ] Verify "Receipt Cancellation" collection type visible
   - [ ] Open Klubr content type, verify connected_account relation present
   - [ ] Open Klubr Document content type, verify managerSignature and managerSignatureValide fields present
   - [ ] Open Trade Policy content type, verify fee_model, fixed_amount, donor_pays_fee fields present
   - [ ] Open Klub Don Payment content type, verify idempotency_key, refund_status, platform_fee_amount, application_fee_amount fields present

3. Test helper utilities
   - [ ] Create simple test script or verify imports work
   - [ ] Verify all exported functions are accessible
   - [ ] Confirm TypeScript compilation succeeds

## Reviewed implementation

- [ ] Phase 1: Create New Content Types
- [ ] Phase 2: Modify Existing Content Types
- [ ] Phase 3: Stripe Connect Helper Utilities
- [ ] Phase 4: Validation

## Validation flow

1. Start Strapi development server: `npm run develop` in donaction-api
2. Check console output for successful database schema synchronization
3. Login to Strapi admin at http://localhost:1437/admin
4. Navigate to Content-Type Builder
5. Verify 4 new content types exist: Connected Account, Webhook Log, Financial Audit Log, Receipt Cancellation
6. Open each new content type and verify all fields defined correctly
7. Open existing content types and verify new fields: Klubr (connected_account relation), Klubr Document (managerSignature json, managerSignatureValide boolean), Trade Policy (fee_model, fixed_amount, donor_pays_fee), Klub Don Payment (idempotency_key, refund_status, platform_fee_amount, application_fee_amount)
8. Navigate to Content Manager and verify all collections are accessible
9. Test creating a sample Connected Account entry to verify schema works
10. Verify helper file exists and exports functions correctly

## Estimations

- Confidence: 9/10
  - ✅ Stripe SDK already at v17.6.0 - no upgrade needed
  - ✅ Clear schema requirements from issue
  - ✅ Strapi v5 auto-migration eliminates manual SQL
  - ✅ Existing content type patterns well-established in codebase
  - ✅ Helper utilities follow existing helper pattern in project
  - ❌ Risk: Complex JSONB fields (metadata, requirements, payload) may need iteration
  - ❌ Risk: Stripe Connect account creation requires proper business verification flow
- Time to implement: 4-6 hours for schema creation and helper utilities, 1-2 hours for validation and testing
