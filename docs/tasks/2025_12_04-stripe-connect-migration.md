# Instruction: Stripe Connect Migration for DONACTION Platform

## Feature

- **Summary**: Migrate from Stripe Standard to Stripe Connect Express accounts, enabling associations to receive donations directly with automated platform fee collection, KYC verification, idempotent payment processing, comprehensive audit trails, and exceptional refund management with tax receipt cancellation workflow
- **Stack**: `Next.js 14`, `Angular 19`, `Svelte 5`, `Strapi 5`, `PostgreSQL`, `Stripe SDK 17`, `TypeScript 5`, `Stripe Connect (Express)`, `pdf-lib`, `Brevo Email API`
- **Branch name**: `feature/stripe-connect-migration`

## Existing files

### Backend (Strapi)
- @klubr-api/src/api/klubr/content-types/klubr/schema.json
- @klubr-api/src/api/klubr/services/klubr.ts
- @klubr-api/src/api/klubr/controllers/klubr.ts
- @klubr-api/src/api/klubr/routes/klubr-custom.ts
- @klubr-api/src/api/klub-don/content-types/klub-don/schema.json
- @klubr-api/src/api/klub-don/services/klub-don.ts
- @klubr-api/src/api/klub-don-payment/controllers/klub-don-payment.ts
- @klubr-api/src/api/klub-don-payment/routes/klub-don-payment.ts
- @klubr-api/src/api/trade-policy/content-types/trade-policy/schema.json
- @klubr-api/src/helpers/emails/sendBrevoTransacEmail.ts
- @klubr-api/src/helpers/klubrPDF/
- @klubr-api/config/database.ts
- @klubr-api/package.json

### Frontend (Next.js)
- @klubr-frontend/src/app/(main)/auth/register/page.tsx
- @klubr-frontend/src/core/services/auth/index.ts
- @klubr-frontend/src/core/services/club/index.ts
- @klubr-frontend/src/core/services/endpoints.ts

### Admin Dashboard (Angular)
- @klubr-admin/src/app/routes/dashboard/ui/dashboard.component.ts
- @klubr-admin/src/app/routes/klub/ui/
- @klubr-admin/src/app/routes/don/ui/
- @klubr-admin/src/app/shared/services/entities/
- @klubr-admin/src/app/shared/utils/models/klubr.ts
- @klubr-admin/src/app/shared/data-access/repositories/shared.service.ts

### Donation Widget (Svelte)
- @klubr-saas/src/components/sponsorshipForm/logic/api.ts
- @klubr-saas/src/components/sponsorshipForm/logic/stripe.ts
- @klubr-saas/src/components/sponsorshipForm/index.svelte

### New files to create

- klubr-api/src/api/connected-account/ (content-type, service, controller, routes)
- klubr-api/src/api/webhook-log/ (content-type, service, controller)
- klubr-api/src/api/financial-audit-log/ (content-type, service, controller)
- klubr-api/src/api/receipt-cancellation/ (content-type, service, controller, routes)
- klubr-api/src/api/stripe-connect/ (service for Stripe Connect API calls)
- klubr-api/src/api/refund-manager/ (service, controller, routes)
- klubr-api/src/helpers/stripe-connect-helper.ts
- klubr-admin/src/app/routes/payment-setup/
- klubr-admin/src/app/routes/payment-status/
- klubr-admin/src/app/routes/trade-policy/
- klubr-admin/src/app/routes/connected-accounts/
- klubr-admin/src/app/routes/refunds/
- klubr-admin/src/app/shared/components/klub-completion-widget/
- Database migration files for schema changes

## Implementation phases

### Phase 1: Database & Backend Foundation

> Setup database schema, Strapi content types, and Stripe SDK integration

1. Create database migration for new tables: `connected_accounts`, `webhook_logs`, `financial_audit_logs`, `receipt_cancellations`
2. Modify existing tables: add `manager_signature` to `klubrs`, add `fee_model`, `fixed_amount`, `donor_pays_fee` to `trade_policies`, add `idempotency_key`, `payment_intent_id`, `refund_status` to `klub_dons`
3. Create Strapi content type for `connected-account` with schema validation
4. Create Strapi content type for `webhook-log` with event type enum
5. Create Strapi content type for `financial-audit-log` with metadata JSONB field
6. Create Strapi content type for `receipt-cancellation` with status workflow enum
7. Update Stripe SDK to v17 in klubr-api package.json
8. Create `stripe-connect-helper.ts` utility file with Express account creation, onboarding link generation, account status fetch functions
9. Run database migrations and test schema changes

### Phase 2: Stripe Connect Integration (Backend)

> Implement Stripe Connect Express account creation, webhooks, and account management

1. Create `/api/stripe-connect` service with methods: `createExpressAccount()`, `generateOnboardingLink()`, `getAccountStatus()`, `syncAccountStatus()`
2. Modify klubr registration Next.js API route to call Stripe Connect service during account creation
3. Create custom Strapi routes: `POST /klubr/:id/stripe/create-account`, `POST /klubr/:id/stripe/onboarding-link`, `GET /klubr/:id/stripe/status`
4. Implement webhook endpoint `POST /stripe/webhook` with signature verification
5. Create webhook handlers for: `account.updated`, `account.application.deauthorized`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
6. Implement webhook logging in `webhook_logs` table for all events
7. Setup webhook retry logic with manual retry endpoint
8. Add cron job to sync Stripe account status daily for all connected accounts
9. Test webhook delivery with Stripe CLI

### Phase 3: Payment Flow Migration (Backend + Svelte)

> Update payment processing to use Stripe Connect with idempotency and fee calculation

1. Modify `klub-don-payment` controller `create-payment-intent` endpoint to accept `idempotencyKey` parameter
2. Implement idempotency check: query `klub_dons` by `idempotency_key`, return existing `clientSecret` if found
3. Add trade policy fee calculation logic: percentage, fixed+percentage, fixed only models
4. Implement `donorPayFee` logic: add fee to total amount if enabled, otherwise deduct from donation
5. Update PaymentIntent creation to include: `application_fee_amount`, `transfer_data.destination`, `stripeAccount` parameter, `idempotencyKey` header
6. Store `payment_intent_id` and `payment_intent_client_secret` in `klub_dons` table after creation
7. Log `payment_intent_created` event in `financial_audit_logs`
8. Update Svelte component to generate idempotency key client-side using `crypto.randomUUID()`
9. Modify Svelte payment logic to reuse `clientSecret` on retry if PaymentIntent still valid (< 24h)
10. Add backend validation to check `charges_enabled: true` before returning donation form data
11. Update Svelte error handling to display account status messages
12. Test payment flow end-to-end with test Stripe account

### Phase 4: Angular Dashboard - Core Features

> Build dashboard homepage widget, payment setup screens, trade policy config, and monitoring

1. Create `klub-completion-widget` component with 3 sections: Klub Info progress bar, Document Upload progress bar, Stripe Account status badge
2. Add visual indicators (checkmark/warning/error icons) and quick action buttons to widget
3. Integrate widget into dashboard homepage component
4. Create `/payment-setup` route with component displaying Stripe onboarding status and "Complete Stripe Setup" button
5. Implement `openStripeOnboarding()` method to fetch onboarding link from backend and open in new tab
6. Create `/payment-status` route with component showing KYC status, charges enabled, payouts enabled indicators
7. Create `/trade-policy` route (superadmin only) with form for fee model selection, donor pays fee toggle, and fee preview calculator
8. Implement trade policy update service method with backend API call
9. Create `/admin/connected-accounts` route with table listing all associations' Stripe Connect status
10. Add filters: KYC complete/incomplete, charges enabled/disabled
11. Add bulk action: "Send KYC Reminder Emails" with confirmation dialog
12. Enhance `/admin/klub/listing` with new column "Stripe Account Status" and same filters
13. Add trade policy read-only display to dashboard homepage widget for association leaders
14. Implement permission guards: `canAccessTradePolicy()` for superadmin only
15. Test all screens with different user roles

### Phase 5: Tax Receipts & Audit Trail

> Update tax receipt generation and implement comprehensive audit logging

1. Add `manager_signature` field to klubr schema with image upload validation
2. Create file upload endpoint for manager signature with ImageKit integration
3. Modify `fiscaux-service` to fetch manager signature URL from klubr table
4. Update PDF generation to embed manager signature image using pdf-lib
5. Update receipt template to use association details (name, SIREN, address) instead of DONACTION
6. Implement net/gross amount logic based on `donorPayFee` flag in trade policy
7. Add receipt generation timestamp to `klub_dons` table
8. Create `financial-audit-log` service with methods: `logDonationCreated()`, `logPaymentIntentCreated()`, `logPaymentSucceeded()`, `logPaymentFailed()`, `logReceiptGenerated()`, `logWebhookReceived()`, `logRefundRequested()`, `logRefundApproved()`
9. Integrate audit logging into all payment flow steps
10. Store actor ID, metadata (Stripe IDs, amounts, errors), and IP address in audit logs
11. Create superadmin audit log viewer at `/admin/audit-logs` with filters and search
12. Add CSV export functionality for audit logs
13. Test receipt generation with manager signature and verify Cerfa compliance

### Phase 6: Exceptional Refund Workflow (Angular + Backend)

> Build refund request management, approval workflow, and Stripe refund processing

1. Create `receipt-cancellation` content type with fields: `original_receipt_id`, `donation_id`, `cancellation_type`, `reason`, `cancelled_amount`, `donor_declaration_signed`, `donor_declaration_document`, `requested_by`, `approved_by`, `status`
2. Create `/refunds` Angular route with component displaying refund requests table
3. Implement role-based filtering: superadmin sees all, association leader sees only their klub's refunds
4. Add status filters: awaiting_declaration, pending_approval, approved, denied, processing, completed
5. Create "New Refund Request" form with fields: refund type dropdown, reason textarea, tax authority notification checkbox
6. Implement backend `POST /refund-manager/create` endpoint with validation
7. Send automated email to donor with declaration PDF template attachment using Brevo
8. Create "Upload Declaration" action button with file upload (PDF validation, max 5MB)
9. Update refund status to `pending_approval` after declaration upload
10. Send email notification to superadmin when refund ready for approval
11. Create approval screen with donation details, tax receipt preview, declaration preview, approve/deny buttons
12. Implement `POST /refund-manager/approve` endpoint with ReceiptCancellation record creation
13. Generate cancellation attestation PDF with original receipt reference, amount, reason, approval date
14. Process Stripe refund via `stripe.refunds.create()` API call
15. Update donation `refund_status` to `completed` and link Stripe refund ID
16. Log all refund actions in `financial_audit_logs`
17. Send email notifications to donor (with cancellation PDF), association leader, and superadmin
18. Implement special case handling: fraud (TRACFIN notification if > 10k€, block donor), legal dispute (freeze), payment error (fast-track), retraction (simple cancellation)
19. Add "Manage Refunds" action button to `/admin/klub/listing` rows
20. Test complete refund workflow with all status transitions

### Phase 7: Email Integration & Notifications

> Implement auto-auth token emails, refund workflow emails, and KYC reminders

1. Modify Next.js registration email template to include auto-auth token in URL query parameter
2. Create Angular auth guard to intercept email link, extract token, validate with backend, and auto-authenticate user
3. Implement redirect logic to "Complete Your Profile" page after auto-auth
4. Create Brevo email template for refund declaration request with PDF attachment
5. Create email template for refund approval notification to donor
6. Create email template for refund approval notification to association leader
7. Create email template for refund audit notification to superadmin
8. Create email template for KYC reminder with onboarding link
9. Implement bulk KYC reminder email service with batching (max 100 per batch)
10. Add email sending to all refund workflow steps using `sendBrevoTransacEmail()` helper
11. Test all email flows with test email addresses
12. Verify email deliverability and template rendering

### Phase 8: Testing & Migration

> End-to-end testing, staging deployment, pilot onboarding, and production rollout

1. Write Strapi integration tests for Stripe Connect service methods
2. Write Angular component tests for all new screens (completion widget, payment setup, refunds)
3. Write Svelte component tests for idempotency and error handling
4. Create end-to-end test suite: registration → KYC → donation → receipt → refund
5. Deploy to staging environment with Stripe test mode
6. Create test Stripe Connect Express account via staging registration
7. Test complete onboarding flow with test association
8. Test payment flow with test cards (success, failure, retry scenarios)
9. Test refund workflow with test refund request
10. Verify webhook delivery and processing in staging
11. Audit staging audit logs for completeness
12. Create data cleanup script to delete all existing donations in production
13. Backup production database before cleanup
14. Execute data cleanup script (requires superadmin confirmation)
15. Deploy Stripe Connect migration to production
16. Onboard 3-5 pilot associations with real Stripe accounts
17. Monitor webhook processing and audit logs closely for 48 hours
18. Email all existing associations with new registration instructions
19. Provide support for associations during onboarding
20. Deprecate old Stripe Standard payment flow (remove old code)
21. Update FAQ with Stripe Connect information and refund process
22. Monitor production metrics: successful payments, KYC completion rate, refund requests

## Reviewed implementation

- [ ] Phase 1: Database & Backend Foundation
- [ ] Phase 2: Stripe Connect Integration (Backend)
- [ ] Phase 3: Payment Flow Migration (Backend + Svelte)
- [ ] Phase 4: Angular Dashboard - Core Features
- [ ] Phase 5: Tax Receipts & Audit Trail
- [ ] Phase 6: Exceptional Refund Workflow (Angular + Backend)
- [ ] Phase 7: Email Integration & Notifications
- [ ] Phase 8: Testing & Migration

## Validation flow

1. Register new association in Next.js → verify user account, klubr profile, and Stripe Express account created
2. Click email link → verify auto-authentication in Angular dashboard
3. View dashboard homepage → verify completion widget shows 3 sections with accurate percentages
4. Complete klub info fields → verify progress bar updates to 100%
5. Upload required documents and manager signature → verify progress bar updates
6. Click "Complete Stripe Setup" → verify Stripe onboarding opens in new tab
7. Complete Stripe KYC → verify account status syncs to "verified" and charges enabled
8. Admin validates documents → verify page activation enabled
9. Donor fills donation form on public site → verify form displays only if charges_enabled
10. Submit payment → verify PaymentIntent created with application fee and destination charge
11. Retry payment (simulate double-click) → verify same donation record and clientSecret returned (idempotency works)
12. Verify payment webhook received → verify donation status updated to succeeded
13. Download tax receipt → verify PDF contains association details and manager signature
14. Verify audit log contains all events: donation created, payment intent created, payment succeeded, receipt generated
15. Association leader creates refund request → verify status "awaiting_declaration" and email sent to donor
16. Upload donor declaration → verify status changes to "pending_approval" and email sent to superadmin
17. Superadmin approves refund → verify Stripe refund processed, cancellation PDF generated, emails sent
18. Verify refund status in donations dashboard shows "completed" with refund ID
19. Superadmin views connected accounts screen → verify all associations listed with accurate Stripe status
20. Superadmin sends bulk KYC reminder emails → verify emails sent to associations with incomplete KYC
21. Test trade policy configuration → verify fee calculation works for all 3 models (percentage, fixed+percentage, fixed)
22. Test donor pays fee → verify total amount includes fee in payment
23. Verify webhook retry → manually trigger failed webhook retry and verify processing
24. Export audit logs to CSV → verify all financial events included with timestamps and actors

## Estimations

### Confidence: 9/10

**High confidence reasons:**
- ✅ Stripe Connect Express is well-documented and widely used
- ✅ Existing Stripe integration provides foundation
- ✅ All required tech stack already in place (Strapi, Angular, Svelte, PostgreSQL)
- ✅ Clear requirements with detailed user stories and acceptance criteria
- ✅ Idempotency pattern is standard for payment systems
- ✅ Webhook handling follows Stripe best practices
- ✅ Audit trail pattern is straightforward database logging
- ✅ Refund workflow has clear state machine
- ✅ Email integration already exists via Brevo

**Risks and considerations:**
- ❌ Stripe Connect account approval times vary (can take 1-7 days for real associations)
- ❌ Webhook reliability depends on network infrastructure (use retry mechanism)
- ⚠️ Manager signature legal compliance requires review by legal team
- ⚠️ TRACFIN notification for fraud cases may require manual process
- ⚠️ Fee statement generation (Phase 4, item 7) requires facturation module refactor (deferred to future)

### Time to implement: 8-10 weeks

**Breakdown by phase:**
- Phase 1 (Database & Backend Foundation): 1 week
- Phase 2 (Stripe Connect Integration): 1.5 weeks
- Phase 3 (Payment Flow Migration): 2 weeks
- Phase 4 (Angular Dashboard - Core Features): 2 weeks
- Phase 5 (Tax Receipts & Audit Trail): 1 week
- Phase 6 (Exceptional Refund Workflow): 2 weeks
- Phase 7 (Email Integration & Notifications): 1 week
- Phase 8 (Testing & Migration): 1.5 weeks

**Team size assumption:** 2-3 developers (1 backend, 1 frontend, 1 full-stack)

**Dependencies:**
- Stripe Express account approval for testing (obtain early in Phase 2)
- Legal review of manager signature and tax receipt format (parallel to Phase 5)
- Facturation module refactor for fee statements (deferred, not blocking)

**Deployment strategy:**
- Staging deployment after Phase 7
- Pilot program with 3-5 associations (Phase 8)
- Full production rollout after 2 weeks of pilot monitoring
- Old flow deprecation after all associations migrated

**Note:** Fee statement generation feature (item 7 in Phase 4 requirements) is documented but deferred to future sprint due to facturation module dependencies. All other requirements are included in this 8-10 week estimate.
