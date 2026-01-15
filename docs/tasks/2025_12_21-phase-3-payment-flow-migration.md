# Instruction: Phase 3 - Payment Flow Migration (Backend + Svelte)

## Feature

- **Summary**: Add Stripe Connect payment path alongside classic Stripe, controlled by `trade_policy.stripeConnect` flag
- **Stack**: `Strapi 5`, `TypeScript 5`, `Svelte 5`, `Stripe 17`
- **Branch name**: `feature/4-phase-3-payment-migration`

## Architecture Decision

**Dual Payment Paths:**
- `stripeConnect: true` → Stripe Connect (on_behalf_of, transfer_data, application_fee)
- `stripeConnect: false` → Classic Stripe (direct payment to platform account)

Each klubr uses ONE path based on their trade_policy. Default: `stripeConnect: true`

Benefits:
- Backward compatibility with legacy flow
- Future flexibility (e.g., platform product sales)
- Gradual migration possible

## Existing files

- @donaction-api/src/api/klub-don-payment/controllers/klub-don-payment.ts
- @donaction-api/src/api/klub-don-payment/services/klub-don-payment.ts
- @donaction-api/src/api/klub-don-payment/routes/klub-don-payment-custom.ts
- @donaction-api/src/api/trade-policy/content-types/trade-policy/schema.json
- @donaction-api/src/helpers/stripe-connect-helper.ts
- @donaction-api/src/_types.ts
- @donaction-saas/src/components/sponsorshipForm/logic/api.ts
- @donaction-saas/src/components/sponsorshipForm/logic/stripe.ts
- @donaction-saas/src/components/sponsorshipForm/logic/useSponsorshipForm.svelte.ts

### New file to create

- @donaction-api/src/helpers/idempotency-helper.ts

## Implementation phases

### Phase 1: Schema & Idempotency Setup

> Add stripeConnect field and idempotency handling

1. Update trade-policy schema
   - [ ] 1.1. Add `stripeConnect` boolean field (default: true)
   - [ ] 1.2. Update `TradePolicyEntity` type in `_types.ts`

2. Create idempotency helper
   - [ ] 2.1. Create `idempotency-helper.ts` with key lookup functions
   - [ ] 2.2. Add `findExistingPaymentIntent()` to check for duplicate requests
   - [ ] 2.3. Store idempotency key in klub-don-payment record

3. Update `createPaymentIntent` controller
   - [ ] 3.1. Accept `idempotencyKey` from request body
   - [ ] 3.2. Check for existing payment intent with same key
   - [ ] 3.3. Return existing clientSecret if found (prevent duplicate charges)

### Phase 2: Dual Payment Path Implementation

> Branch logic based on trade_policy.stripeConnect

1. Fetch klubr context before payment
   - [ ] 1.1. Get klubr's trade_policy with stripeConnect flag
   - [ ] 1.2. If stripeConnect=true, fetch connected_account
   - [ ] 1.3. Validate charges_enabled for Connect path only

2. Classic Stripe path (stripeConnect=false)
   - [ ] 2.1. Keep existing PaymentIntent creation logic
   - [ ] 2.2. Add idempotency_key to Stripe API call
   - [ ] 2.3. No fees, no transfers

3. Stripe Connect path (stripeConnect=true)
   - [ ] 3.1. Calculate application_fee via `calculateApplicationFee()`
   - [ ] 3.2. Add `donorPayFee` logic: if true, add fee to total
   - [ ] 3.3. Add `on_behalf_of` with connected account ID
   - [ ] 3.4. Add `transfer_data.destination` for connected account
   - [ ] 3.5. Add `application_fee_amount` from calculation
   - [ ] 3.6. Pass `idempotency_key` to Stripe API call

4. Store payment details
   - [ ] 4.1. Store fee breakdown in klub-don-payment
   - [ ] 4.2. Store payment_method (classic/connect)
   - [ ] 4.3. Store idempotency key reference

5. Add audit logging (Connect path only)
   - [ ] 5.1. Call `logFinancialAction()` for payment intent creation
   - [ ] 5.2. Log fee calculation details in metadata

### Phase 3: Svelte Widget Updates

> Implement idempotency and clientSecret reuse in widget

1. Add idempotency key generation
   - [ ] 1.1. Generate unique key on payment initiation (UUID v4)
   - [ ] 1.2. Store key in component state

2. Update `createPaymentIntent()` API call
   - [ ] 2.1. Include idempotencyKey in request payload
   - [ ] 2.2. Include donorPayFee flag from form

3. Implement clientSecret reuse on retry
   - [ ] 3.1. Store clientSecret in state after first successful call
   - [ ] 3.2. On retry, send same idempotencyKey
   - [ ] 3.3. Reuse returned clientSecret (should be same)

4. Improve error handling
   - [ ] 4.1. Handle charges_enabled error with user-friendly message
   - [ ] 4.2. Handle payment retry scenarios gracefully
   - [ ] 4.3. Clear idempotency state on form reset

### Phase 4: Testing & Validation

> End-to-end testing of both payment paths

1. Backend unit tests
   - [ ] 1.1. Test idempotency key lookup/storage
   - [ ] 1.2. Test fee calculation with different trade policies
   - [ ] 1.3. Test charges_enabled validation (Connect path)
   - [ ] 1.4. Test payment path branching logic

2. Integration tests
   - [ ] 2.1. Test classic Stripe flow (stripeConnect=false)
   - [ ] 2.2. Test Stripe Connect flow (stripeConnect=true)
   - [ ] 2.3. Test retry with same idempotency key (both paths)
   - [ ] 2.4. Verify audit logs created (Connect path)

## Reviewed implementation

- [x] Phase 1
- [x] Phase 2
- [x] Phase 3
- [x] Phase 4

## Validation flow

### Stripe Connect path (stripeConnect=true)
1. Create donation with donorPayFee=true
2. Attempt payment - verify fee added to total
3. Simulate network error, retry payment
4. Verify same clientSecret returned (idempotency)
5. Complete payment, verify:
   - Funds go to connected account
   - Platform fee deducted correctly
   - Audit log created
6. Test with charges_enabled=false, verify error

### Classic Stripe path (stripeConnect=false)
1. Create klubr with stripeConnect=false trade policy
2. Create donation
3. Complete payment, verify:
   - Funds stay on platform account
   - No fees applied
   - No audit log

## Estimations

- **Confidence**: 9/10
  - ✅ Clear existing patterns in codebase
  - ✅ `calculateApplicationFee()` already implemented
  - ✅ Stripe Connect setup complete from Phase 2
  - ✅ Dual-path approach reduces migration risk
  - ❌ Risk: Need to handle edge cases in retry logic
