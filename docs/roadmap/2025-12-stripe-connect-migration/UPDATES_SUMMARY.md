# Stripe Connect Migration - Updates Summary

**Date:** 2025-12-03  
**Status:** Requirements refined with client feedback

---

## Key Updates Based on Client Feedback

### 1. Registration Flow Clarifications

**Existing Implementation:**
- ✅ Step 1: Association leader info (nom, prenom, birthDate, tel, email)
- ✅ Step 2: Association info (clubName, acronyme, adresse, legalStatus, sportType, conditions)
- ✅ User account + Klubr profile creation
- ✅ Email with activation link
- ✅ Auto-link user to klubr profile

**To Implement:**
- ⚠️ Auto-authentication in Angular after email link click
- ⚠️ Complete "Redirect to Complete Your Profile" page

**New Feature:**
- 🆕 Dashboard homepage completion status widget
  - 3 sections: Klub Info / Docs / Stripe Account
  - Progress bars and visual indicators (✅/⚠️/❌)
  - Quick action buttons for each section

---

### 2. Angular Dashboard Enhancements

**Trade Policy Configuration:**
- 🔒 Access: Superadmin ONLY (not association leaders)
- 📊 Display on dashboard homepage for association leaders (read-only)
- Location: Klub completion status widget

**Superadmin Monitoring:**
- 🆕 New dedicated screen: `/admin/connected-accounts`
- ✏️ Enhanced existing screen: `/admin/klub/listing`
  - New column: Stripe Account Status
  - New filters: KYC complete/incomplete, charges enabled/disabled
  - Bulk action: Send KYC reminder emails

**Fee Statement Generation:**
- ⚠️ Note: Requires facturation module refactoring
- Priority: Medium (after core features)

**Refund Management:**
- 🆕 Access from `/admin/klub/listing` via "Manage Refunds" button per klub
- 🔒 Access control: Superadmin (all) + Association Leader (own klub only)

---

### 3. Error Handling Strategy

**Backend Validation (Primary):**
- ✅ Check `charges_enabled: true` BEFORE displaying donation form
- This prevents 99% of `account_inactive` and `account_kyc_incomplete` errors

**Svelte Defensive Handling (Secondary):**
- 🛡️ Handle `account_inactive` and `account_kyc_incomplete` as safety net
- Note: Should rarely trigger due to backend validation

**Rationale:**
- Backend validation is authoritative
- Frontend handles edge cases (race conditions, stale data)

---

### 4. Exceptional Refund Workflow - Complete Redesign

**Current State:**
- Manual process via email to support team
- No system tracking
- Mentioned in FAQ as manual-only

**New System:**
- 🆕 Admin interface to manage manual workflow
- 🔄 7-step process with status tracking
- 📧 Automated email notifications at each step
- 📁 Document management (signed declarations)
- 🔐 Role-based access control
- 📊 Audit trail for all actions

**Process Phases:**

1. **Request Initiation**
   - Donor emails support → Association leader creates request in system
   - Status: `awaiting_declaration`

2. **Donor Declaration**
   - System emails donor with declaration PDF template
   - Donor signs and emails back
   - Association leader uploads to system
   - Status: `pending_approval`

3. **Approval**
   - Superadmin OR Association Leader reviews and approves/denies
   - Status: `approved` or `denied`

4. **Stripe Refund**
   - System processes refund via Stripe API
   - Status: `processing` → `completed` or `failed`

5. **Notifications**
   - Emails sent to: Donor, Association Leader, Superadmin
   - Includes cancellation attestation PDF

**Access Control:**
- Superadmin: Full access to ALL refund requests
- Association Leader: Access ONLY to their klub's refunds

**Special Cases:**
- Fraud (> 10k€): TRACFIN notification, block donor
- Legal dispute: Freeze until court decision
- Payment error: Fast-track if no receipt generated
- Retraction (14 days): Simple cancellation

**Database Changes:**
- Modified `receipt_cancellations` table with status workflow
- New event types in `financial_audit_logs`

---

## Visual Documentation

### Created Diagrams:

1. **Sequence Diagram:** Complete refund workflow (donor → system → Stripe)
2. **State Machine:** Refund request status transitions
3. **Access Control Matrix:** Role-based permissions
4. **Status Flow:** Visual representation of decision points
5. **Email Notification Flow:** All automated emails
6. **Technical Architecture:** System components

**Location:** `docs/roadmap/2025-12-stripe-connect-migration/refund-workflow-diagram.md`

---

## Implementation Priority

### Phase 1: Core Features (MVP)
1. Stripe Connect integration (backend + webhooks)
2. Registration flow completion (auto-auth + redirect)
3. Dashboard homepage widget (completion status)
4. Payment flow with idempotency
5. Tax receipt with manager signature

### Phase 2: Admin Features
1. Trade policy configuration (superadmin only)
2. Superadmin monitoring enhancements
3. Enhanced donation dashboard
4. Audit trail implementation

### Phase 3: Refund Workflow
1. Refund request creation (admin interface)
2. Document upload and management
3. Approval workflow
4. Stripe refund processing
5. Email notifications
6. Audit logging

### Phase 4: Advanced Features
1. Fee statement generation (requires facturation refactor)
2. Bulk KYC reminder emails
3. Financial reporting dashboard
4. Tax authority notification automation

---

## Next Steps

1. ✅ Requirements approved with client feedback integrated
2. ⏭️ Generate technical implementation plan
3. ⏭️ Break down into user stories with Gherkin acceptance criteria
4. ⏭️ Create GitHub issues with Epic linking
5. ⏭️ Estimate effort and prioritize
6. ⏭️ Begin Phase 1 development

---

## Updated Documents

- ✅ `user_stories_stripe_connect_discussion.md` - Complete requirements with all updates
- ✅ `refund-workflow-diagram.md` - Visual guide for refund process
- ✅ `UPDATES_SUMMARY.md` - This document
- 📄 `refund-edge-case-tax-receipts.md` - Original refund legal requirements (unchanged)

---

## Questions Resolved

| Question | Answer |
|----------|--------|
| Auto-auth after email link? | To implement |
| Trade policy access for association leaders? | Read-only display on dashboard, edit only for superadmin |
| Refund workflow automation? | Semi-automated: admin interface + manual approval + automated processing |
| Error handling strategy? | Backend validation primary, frontend defensive secondary |
| Fee statement priority? | After core features, requires facturation refactor |


---

## 🔴 Phase 0 Added: Angular 21 Migration

**Date:** 2025-12-04  
**Priority:** CRITICAL PREREQUISITE

### Rationale

To leverage the latest Angular 21 features for the entire Stripe Connect Epic:
- **Signal Forms** for all new form implementations
- **Enhanced Signals API** for better state management
- **Performance improvements** with new change detection
- **Modern patterns** for maintainability

### Impact on Timeline

- **Original Estimate:** 8-10 weeks
- **Updated Estimate:** 9-11 weeks (includes 1 week for Angular 21 migration)

### Phase 0 Tasks

1. Update dependencies (@angular/*, TypeScript, PrimeNG, NgRx)
2. Run Angular migration schematics
3. Refactor to Signal Forms and modern APIs
4. Update tests and documentation
5. Team training on new patterns

### Blockers

⚠️ **All other phases (#5-#12) are blocked until Phase 0 is complete**

This ensures:
- Consistent use of Angular 21 patterns across all new code
- No need to refactor Phase 1-8 code later
- Maximum benefit from performance improvements
- Team alignment on modern Angular practices

### Issue

- Phase 0: #13
