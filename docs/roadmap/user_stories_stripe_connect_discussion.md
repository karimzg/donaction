# Stripe Connect Migration - Requirements Discussion

**Project:** DONACTION
**Epic:** Migration from Stripe Standard to Stripe Connect
**Date:** 2025-12-03
**Status:** Requirements Refinement Phase

---

## Stripe Connect Account Type Recommendation

**Recommended: Express Accounts**

| Type | Pros | Cons | Recommendation |
|------|------|------|----------------|
| **Standard** | Association owns relationship with Stripe, full control | Associations leave Stripe ecosystem when offboarding, complex setup | ❌ Too complex for non-tech associations |
| **Express** | Stripe-hosted onboarding, DONACTION maintains relationship, simpler KYC | Less customization on onboarding UI | ✅ **BEST FIT** - Balance of simplicity + control |
| **Custom** | Full UI control, embedded experience | You handle all compliance/KYC UI, most development effort | ❌ Overkill for this use case |

**Why Express?**
- Stripe handles KYC UI (less dev work)
- DONACTION keeps control of relationship
- Associations don't need separate Stripe accounts
- Easy to monitor all accounts from platform
- Built-in compliance checks

---

## Clarifications Needed

### 1. Partial Payment Scenario
You're right - in normal flow there's one payment. I was thinking of this edge case:

**Scenario:** Svelte component calls backend to create `PaymentIntent` with application_fee_amount, but:
- PaymentIntent created successfully
- Donor completes payment
- But webhook delivery fails OR Strapi crashes before recording donation

**Result:** Money moved, but no database record.

**Question:** Should we implement idempotency keys + reconciliation dashboard to catch these?

### 2. Audit Trail Definition
An audit trail means: timestamped log of all financial events.

**Example:**
```
2025-12-03 10:23:14 | Donation #123 created | Amount: 100€ | Fee: 5€ | Status: pending
2025-12-03 10:23:45 | PaymentIntent created | Stripe PI: pi_xyz | Association: acct_abc
2025-12-03 10:24:12 | Payment succeeded | Webhook received | Status: succeeded
2025-12-03 10:24:15 | Tax receipt generated | PDF: receipt_123.pdf
```

**Question:** Do you need this for debugging/compliance? Or is Stripe Dashboard + Strapi records enough?

### 3. Billing & Compliance

**Current Understanding:**
- **Old:** Klubr invoices associations monthly for fees collected
- **New:** Stripe automatically deducts `application_fee` from each transaction

**Questions:**
- Do you still need to invoice associations? Or just provide a fee statement/report?
- For Stripe: No invoice needed - they handle fee collection automatically via Connect
- For French accounting: Do associations need a "justificatif" (proof document) from DONACTION for fees paid?

**Compliance Requirements:**
- **GDPR:** Stripe is compliant, but add data processing agreement in association TOS
- **AML (Anti-Money Laundering):** Stripe Connect handles this via KYC
- **French Tax Law (Cerfa):** Tax receipts must include association SIREN, manager signature (✅ you're adding this), donation amount, date
- **PCI-DSS:** Stripe handles card data, DONACTION never touches it

---

## Refined Feature Requirements (Final Version)

### Project Context
- **Project Name:** DONACTION
- **Migration Type:** Fresh start (delete old donations, rebuild on Stripe Connect)
- **Scope:** EUR only, French residents, single-tenant (multi-tenant deferred)

---

### 1. Association Onboarding & Account Management

#### 1.1 Registration Flow (Next.js → Email → Angular)

**Next.js Registration Page:**
- Collect: Association name, address, email, password, sport type
- Create: User account + Klubr profile + **Stripe Express Account**
- Send: Email with activation link (contains token to auto-login + link to Angular)

**Email Link Behavior:**
- Auto-authenticate user in Angular Dashboard
- Connect user account to klubr profile
- Redirect to "Complete Your Profile" page

**Angular Dashboard Completion:**
- **Klub Info Page:** Complete all required fields (`requiredFieldsCompletion` → 100%)
- **Document Upload:** Upload required legal docs (`requiredDocsValidatedCompletion` → 100%)
  - Add new field: **`managerSignature`** (image upload) in `klubr` table for tax receipt signing
- **Stripe Connect KYC:** Link to continue Stripe Express onboarding (hosted by Stripe)
- **Manual Validation:** DONACTION admin validates docs (sets validation flag)
- **Page Activation:** Enable only when:
  - `klubr-info.requiredDocsValidatedCompletion === 100`
  - `klubr-info.requiredFieldsCompletion === 100`
  - Stripe Connect account status = `charges_enabled: true`

#### 1.2 Stripe Connect Integration (Backend - Strapi)

**New Content Type: `ConnectedAccount`**
```typescript
{
  klubr: Relation<Klubr>                    // OneToOne
  stripeAccountId: string                   // acct_xxx
  status: enum                              // pending, active, restricted, disabled
  chargesEnabled: boolean
  payoutsEnabled: boolean
  requirementsCurrentlyDue: JSON            // Stripe requirements object
  onboardingLink: string                    // Refresh link if incomplete
  lastSyncedAt: datetime
}
```

**New Strapi Routes:**
- `POST /klubr/:id/stripe/create-account` - Create Express account during registration
- `POST /klubr/:id/stripe/onboarding-link` - Generate/refresh onboarding URL
- `GET /klubr/:id/stripe/status` - Fetch account status from Stripe API
- `POST /stripe/webhook` - Handle Stripe Connect webhooks

**Required Webhooks:**
- `account.updated` - Sync KYC status to `ConnectedAccount`
- `account.application.deauthorized` - Handle disconnection
- `payment_intent.succeeded` - Confirm donation payment
- `payment_intent.payment_failed` - Mark donation as failed
- `charge.refunded` - (blocked, log warning if happens)

**Webhook Retry Strategy:**
- Stripe retries automatically for 3 days
- Log all webhook events in new table `WebhookLog` (id, event_type, status, payload, processed_at)
- Dashboard view for failed webhooks with manual retry button

#### 1.3 Angular Dashboard Features

**New Screens:**

1. **Payment Account Activation** (`/payment-setup`)
   - Display Stripe onboarding status (incomplete/complete)
   - Button: "Complete Stripe Setup" → Opens Stripe-hosted onboarding
   - Show requirements still due (if any)

2. **Payment Account Status** (`/payment-status`)
   - Visual indicator: KYC status (pending/verified/restricted)
   - Charges enabled: ✅/❌
   - Payouts enabled: ✅/❌
   - Link to refresh onboarding if incomplete
   - Button to disconnect account (confirmation modal)

3. **Trade Policy Configuration** (`/trade-policy`)
   - Select fee model:
     - Percentage only (e.g., 5%)
     - Fixed + Percentage (e.g., 0.50€ + 3%)
     - Fixed only (e.g., 1€ per transaction) *(new option)*
   - Toggle: "Donor pays fee" (default: deducted from donation)
   - Preview calculation example

4. **Donation Dashboard** (existing `/dons` enhanced)
   - Filter by association (for superadmin: global view)
   - Columns: Date, Donor, Amount, Fee, Net, Status, Receipt
   - Export to CSV (accounting format)

5. **Superadmin Monitoring** (`/admin/connected-accounts`)
   - Table of all associations with Connect status
   - Filters: KYC complete/incomplete, charges enabled/disabled
   - Bulk actions: Send KYC reminder emails

---

### 2. Donation Flow (Svelte Web Component)

#### 2.1 Payment Creation Flow

**Updated Logic:**
1. Donor fills form (steps 1-3: amount, info, project selection)
2. Step 4 (Payment):
   - Svelte calls backend: `POST /klub-don-payments/create-payment-intent`
   - Backend params:
     ```typescript
     {
       amount: number,           // Donation amount
       klubrId: string,
       projectId?: string,
       donorId: string,
       applyFeeToAmount: boolean  // From trade policy "donorPayFee"
     }
     ```
   - Backend logic:
     ```typescript
     const klubr = await getKlubr(klubrId);
     const connectedAccount = await getConnectedAccount(klubr);
     const tradePolicy = await getTradePolicy(klubr);

     let totalAmount = amount;
     const fee = calculateFee(amount, tradePolicy);

     if (tradePolicy.donorPayFee) {
       totalAmount = amount + fee;  // Donor pays extra
     }

     const paymentIntent = await stripe.paymentIntents.create({
       amount: totalAmount * 100,  // Cents
       currency: 'eur',
       application_fee_amount: fee * 100,
       transfer_data: {
         destination: connectedAccount.stripeAccountId,
       },
       metadata: {
         klubrId,
         donationId: donationRecord.id
       }
     }, {
       stripeAccount: connectedAccount.stripeAccountId  // CRITICAL
     });
     ```
   - Return `clientSecret` to Svelte

3. Svelte uses Stripe Elements to confirm payment
4. On success → Show confirmation + tax receipt download link

#### 2.2 Error Handling in Svelte

**New Error Cases:**
- `account_inactive` - Association's Stripe account disabled
  - **UX:** Show message: "This association is temporarily unable to accept donations. Please try again later or contact them directly."

- `account_kyc_incomplete` - KYC requirements pending
  - **UX:** Gray out form, show: "This association is completing their payment setup. Donations will be available soon."

- `payment_failed` - Card declined, insufficient funds, etc.
  - **UX:** Current retry mechanism + 10-min cron email

#### 2.3 Suggested Improvement for Payment Retry

**Current:** Cron job every 10 min → email link to step 4

**Suggested Enhancement:**
- Add "Retry Payment" button directly on confirmation page (if payment failed)
- Store PaymentIntent ID in localStorage
- Allow instant retry without re-creating intent (reuse same `clientSecret` if still valid)
- Cron job as backup only (for users who closed browser)

**Implementation:**
```typescript
// In Svelte component
if (paymentStatus === 'failed') {
  showRetryButton = true;
  // Reuse existing clientSecret for 24 hours
  if (!isExpired(paymentIntent.created)) {
    retryPayment(existingClientSecret);
  } else {
    createNewPaymentIntent();
  }
}
```

---

### 3. Tax Receipt Generation

#### 3.1 Updated Receipt Service (Strapi)

**Changes to `fiscaux-service`:**
- Fetch association details from `klubr` table:
  - `name`, `siren`, `address`, `managerSignature` *(new field)*
- Generate PDF with:
  - **Association info** (not DONACTION info)
  - Donation amount (net or gross depending on `donorPayFee`)
  - Date, donor name
  - Manager signature image (embedded from `klubr.managerSignature`)
  - Cerfa-compliant format

**Storage:**
- Save PDF in `private-pdf/` folder
- Link to donation record in `klub-don`

---

### 4. Database Schema Changes

#### New Table: `ConnectedAccount`
```sql
CREATE TABLE connected_accounts (
  id SERIAL PRIMARY KEY,
  klubr_id INT UNIQUE REFERENCES klubrs(id),
  stripe_account_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  requirements_currently_due JSONB,
  onboarding_link TEXT,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### New Table: `WebhookLog`
```sql
CREATE TABLE webhook_logs (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE,
  event_type VARCHAR(100),
  status VARCHAR(50),  -- received, processed, failed
  payload JSONB,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Modified Table: `klubrs`
```sql
ALTER TABLE klubrs ADD COLUMN manager_signature VARCHAR(255);  -- URL to uploaded image
```

#### Modified Table: `trade_policies`
```sql
ALTER TABLE trade_policies ADD COLUMN fee_model VARCHAR(50);  -- 'percentage', 'fixed_plus_percentage', 'fixed'
ALTER TABLE trade_policies ADD COLUMN fixed_amount DECIMAL(10,2);
ALTER TABLE trade_policies ADD COLUMN donor_pays_fee BOOLEAN DEFAULT false;
```

---

### 5. Compliance & Legal

#### 5.1 GDPR Compliance
- Add to association TOS: "Data processing agreement with Stripe"
- Privacy policy update: Mention Stripe as payment processor
- Right to access: Include Stripe data in data export requests

#### 5.2 French Tax Law (Cerfa)
- Tax receipts must include:
  - ✅ Association name, SIREN, address
  - ✅ Donation amount, date
  - ✅ Manager signature (new field added)
  - ✅ Cerfa-compliant template

#### 5.3 Accounting & Reporting
- **For Associations:** Monthly fee statement (not invoice) with:
  - Total donations received
  - Total fees paid to DONACTION
  - Net amount deposited to bank
  - Export as CSV/PDF

- **For DONACTION:**
  - No need to invoice associations (Stripe auto-deducts fees)
  - Optional: Generate "justificatif de frais" (fee proof document) if required by French accounting law
  - Export global revenue report (all fees collected)

#### 5.4 Audit Trail
**Recommendation:** Implement lightweight audit log

**New Table: `FinancialAuditLog`**
```sql
CREATE TABLE financial_audit_logs (
  id SERIAL PRIMARY KEY,
  donation_id INT REFERENCES klub_dons(id),
  event_type VARCHAR(100),  -- 'donation_created', 'payment_succeeded', 'receipt_generated', etc.
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Log Events:**
- Donation created
- PaymentIntent created (store Stripe PI ID)
- Payment succeeded/failed
- Tax receipt generated
- Webhook received
- Refund attempted (blocked)

**Dashboard:** Superadmin view to search/filter audit logs

---

### 6. Migration Strategy

#### 6.1 Data Cleanup
- Delete all existing donations (`klub_dons` table)
- Archive old data to separate database (optional backup)
- Reset donation IDs to start from 1

#### 6.2 Rollout Plan
1. **Phase 1:** Deploy Stripe Connect to staging
2. **Phase 2:** Onboard 3-5 pilot associations (test KYC, payments, receipts)
3. **Phase 3:** Email all existing associations with new onboarding instructions
4. **Phase 4:** Go live, monitor webhooks closely
5. **Phase 5:** Deprecate old payment flow entirely

---

### 7. Testing Acceptance Criteria

#### 7.1 Association Flow
- [ ] Register in Next.js → receive email → click link → auto-login to Angular
- [ ] Complete fields/docs → upload manager signature → submit for validation
- [ ] Admin validates docs → association sees "complete Stripe setup" button
- [ ] Click button → redirected to Stripe onboarding → complete KYC
- [ ] Return to Angular → status shows "verified" → page activation enabled

#### 7.2 Donation Flow
- [ ] Donor fills form → selects association with active Stripe account
- [ ] Payment succeeds → money goes to association's account
- [ ] DONACTION fee auto-deducted by Stripe
- [ ] Tax receipt generated with association's name and manager signature
- [ ] Receipt PDF downloadable

#### 7.3 Edge Cases
- [ ] Association with incomplete KYC → donation form blocked with message
- [ ] Association disconnects Stripe account → mark as inactive in database
- [ ] Payment fails → retry button appears + fallback cron email after 10 min
- [ ] Webhook failure → logged in `WebhookLog` with retry option

#### 7.4 Superadmin
- [ ] View all connected accounts with status indicators
- [ ] Filter by KYC incomplete → send bulk reminder emails
- [ ] View global donation dashboard (all associations)
- [ ] Export accounting report (fees collected by period)
- [ ] Manual webhook retry for failed events

---

## Summary of Key Decisions

| Topic | Decision |
|-------|----------|
| **Stripe Account Type** | Express (Stripe-hosted onboarding) |
| **Fee Models** | 3 options: percentage, fixed+percentage, fixed only |
| **Fee Payment** | Configurable: deducted from donation OR paid by donor |
| **Migration** | Fresh start (delete old donations) |
| **Activation Gates** | 100% fields + 100% docs + Stripe verified + manual validation |
| **Tax Receipt** | Association's name + manager signature field |
| **Retry Mechanism** | Instant retry button + 10-min cron backup |
| **Audit Trail** | Lightweight log table for financial events |
| **Billing** | Fee statement (not invoice), Stripe handles collection |
| **Multi-tenant** | Deferred to future (not in this epic) |

---

## Open Questions for Final Approval

1. **Idempotency for PaymentIntent creation:** Should we implement idempotency keys to prevent duplicate charges if donor double-clicks submit?
2. **Audit trail depth:** Full log table or rely on Stripe Dashboard + Strapi records?
3. **Fee justificatif:** Do associations need a formal document from DONACTION for fees paid (for their accounting)?
4. **Refund edge case:** Even though tax receipts are immutable, should we have a process for exceptional cases (e.g., fraud, legal dispute)?

---

## Next Steps

Once you review and approve these requirements, we'll proceed to:
1. Generate detailed technical implementation plan
2. Break down into user stories with Gherkin acceptance criteria
3. Create GitHub issues with proper Epic linking

**Awaiting your feedback on the open questions and overall requirements approval.**
