1.1 Registration Flow (Next.js → Email → Angular)
Next.js Registration Page:
Collect (already exists):
- Step 1(Association leader info): nom , prenom, birthDate, tel, email.
- Step 2 (association): clubName, acronyme, adresse, legalStatus, sportType, acceptConditions1, acceptConditions2,
  Create: User account + Klubr profile + Stripe Express Account
  Send: Email with activation link to Angular (contains token to auto-link user account to profil (association leader))
  Email Link Behavior:
  Auto-authenticate user in Angular Dashboard (not implemented yet)
  Connect user account to klubr profile (implemented)
  Redirect to "Complete Your Profile" page (not full implemented yet)
  Angular Dashboard Completion:
  Add a summary of klub completion status (3 sections: klub info/doc upload/stripe account) in dashboard homepage

1.3 Angular Dashboard Features
New Screens:
- Payment Account Activation (/payment-setup)
- Payment Account Status (/payment-status)
- Trade Policy Configuration (/trade-policy) - 3 fee models + donor pays toggle (avalaible only for superadmin. Trade Policy could be displayed on dashboard homepage for association leader as readonly in klub completion status section
- Enhanced Donation Dashboard (/dons)
- Superadmin Monitoring (/admin/connected-accounts). we could also add info and filters in /admin/klub/listing
- Fee Statement Generation (/fee-statements) : need to refactor facturation module
- Exceptional Refund Management (/refunds)

2.2 Error Handling
- account_inactive → "Association temporarily unable to accept donations": should not append because we check charges_enabled before enabling donation
- account_kyc_incomplete → Gray out form with status message: same for this one
We could implement thes 2 error handling in case donation form is displayed dispate the account is not ready to accept donation

8. Exceptional Refund Workflow
- User ask for exceptional refund management feature for donations made to their association by email to support team (association leader)
- This process is manual for now, but we want to automate it in the future. It should be mentionned in FAQ.
- Add new feature in admin dashboard to manage exceptional refunds
  - Admin Dashboard: from /admin/klub/listing, ask for exceptional refund management screen for a donation(/refunds) - accessible only by authorized admins (superadmin role and association leader)
  - Admin Dashboard: New `/refunds` screen to list and manage exceptional refunds
  - Refund Request Form: Form for associations to request exceptional refunds with reason
  - Email to user: send "Signed donor declaration" by email to support team (association leader) when exceptional refund is requested
  - Association leader/Admin Approval Workflow: when receiving "Signed donor declaration" PDF, upload it to refund request, and approve or deny refund requests
  - Refund Processing: Upon approval, process refund via Stripe API and log transaction
  - Notification System: Notify associations and user (and also superadmin) of refund request status via email
  - Update Donation Records: Mark donations as refunded in the system (with link to refund transaction)
  - Dashboard Filters: Filter refund requests by status (pending, approved, denied, processed)
  - Audit Trail: Maintain logs of all refund requests and actions taken for compliance
  - Reporting: Generate reports on exceptional refunds for financial review
  - Security Measures: Ensure only authorized admins can access and manage refunds
Generate a mermaid of this process
