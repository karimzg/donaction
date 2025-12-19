---
name: api-docs
description: API endpoint reference and external integrations
argument-hint: N/A
---

# API Documentation

## Endpoints

- Base URL: `/api` - Strapi REST API base
- Versioning: None - Single version API
- Protocol: HTTPS (production), HTTP (development)

## Key Endpoints

### Klubr (Clubs)
- `GET /klubrs` - List clubs with filters
- `GET /klubrs/:uuid` - Get club by UUID
- `GET /klubrs/bySlug/:slug/:preview?` - Get club by slug with preview support
- `GET /klubrs/stats-all` - Admin: Get all clubs stats
- `GET /klubrs/:uuid/stats` - Owner/Admin: Get club stats
- `POST /klubrs/new/by-leader/:memberUuid` - Create club from member
- `POST /klubrs/:code/send-invitation` - Send club invitation
- `POST /klubrs/:uuid/create-documents` - Owner/Admin: Generate documents
- `POST /klubrs/:uuid/documents` - Owner/Admin: Upload documents
- `PUT /klubrs/:uuid/documents/validate` - Admin: Validate documents
- `GET /klubrs/:uuid/documents/:doc` - Owner/Admin: Download document

### Klubr Membres (Members)
- `GET /klubr-membres` - List members
- `GET /klubr-membres/:uuid` - Get member by UUID
- `POST /klubr-membres` - Create member
- `POST /klubr-membres/for-front` - Create member from frontend
- `PUT /klubr-membres/:uuid` - Update member
- `PUT /klubr-membres/for-front/:uuid` - Update member from frontend
- `POST /klubr-membres/link-to-user/:code` - Link member to user account
- `POST /klubr-membres/switch-to/:uuid` - Switch to member profile
- `POST /klubr-membres/switch-to-admin-editor/:klubUuid` - Admin: Switch to admin editor profile
- `POST /klubr-membres/:code/send-invitation` - Send member invitation

### Invoices
- `GET /invoices` - List user invoices
- `GET /invoices/:id` - Get invoice by ID
- `GET /invoices/generate/:month/:year/:genPdf?/:send?` - Generate invoices for period
- `GET /invoices/:clubUuid/generate/:month/:year/:genPdf?/:send?` - Generate invoices for club
- `GET /invoices/:uuid/pdf` - Generate invoice PDF
- `GET /invoices/:uuid/send` - Send invoice email

### Donations
- `POST /klub-don-payments/create-payment-intent` - Create Stripe payment intent
- `POST /klub-don-payments/stripe-web-hooks` - Stripe webhook handler (no auth)
- `GET /klub-don-payments/check` - Check payment status

## Middlewares

### Custom Middlewares
- `global::request-logger` - Logs all incoming requests
- `api::klubr.owner-or-admin` - Restricts access to club owner or admin
- `api::klubr.admin-editor-or-admin` - Restricts access to admin editor or admin
- `api::klubr.remove-unauthorized-fields` - Sanitizes response fields based on permissions
- `api::invoice.my-invoices` - Restricts invoices to user's own invoices
- `api::klubr-membre.can-create` - Validates member creation permissions
- `api::klubr-membre.can-update` - Validates member update permissions
- `api::klubr-membre.admin` - Admin-only access

### Built-in Strapi Middlewares
- `strapi::errors` - Global error handler
- `strapi::security` - Security headers and CSP configuration
- `strapi::cors` - CORS configuration
- `strapi::body` - Body parsing with 20MB limit, multipart support

## Rate Limiting

- Default limit: 25 records per page
- Max limit: 100 records per page
- Pagination: Enabled with count - `withCount: true`

## External Integrations

### Stripe
- Payment processing via Stripe SDK
- Webhook endpoint: `/klub-don-payments/stripe-web-hooks`
- Secret key: `process.env.STRIPE_SECRET_KEY`

### Brevo (Email)
- Email provider: Brevo SMTP relay
- Configuration: @donaction-api/config/plugins.ts
- SDK integration: `sib-api-v3-sdk`

### ImageKit
- Upload provider: `strapi-provider-upload-imagekit`
- Configuration: @donaction-api/config/plugins.ts
- Folder management for avatars and media

### Google Cloud
- Authentication library for Google APIs
- Used for club assessments and place data
