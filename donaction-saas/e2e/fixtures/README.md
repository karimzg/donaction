# E2E Test Fixtures

This directory contains all fixture files for the donaction-saas E2E test suite.

## Directory Structure

### /klubr-configs/

Klubr configuration fixtures representing different trade policy and feature scenarios.

| File | Purpose |
|------|---------|
| `standard.json` | Default klubr without Stripe Connect |
| `stripe-connect-choice-enabled.json` | Stripe Connect with donor fee choice, project pays fees |
| `stripe-connect-no-choice-club-pays.json` | Stripe Connect, no choice, club absorbs fees |
| `stripe-connect-no-choice-donor-pays.json` | Stripe Connect, no choice, donor pays all fees |
| `custom-commission.json` | Custom 6% commission rate with Stripe Connect |
| `no-contribution.json` | Disabled klubr contribution feature |

Each config includes:
- `klubr`: Club details with uuid, logo, house styling, and trade policy
- `project`: null (for project selection tests)
- `allowProjectSelection`: true/false flag
- `allowKlubrContribution`: true/false flag

### /projects/

Project list API responses.

| File | Purpose |
|------|---------|
| `projects-list.json` | 3 published projects with full details |
| `empty-projects.json` | Empty projects response |

### /donors/

Donor/donateur creation API responses.

| File | Purpose |
|------|---------|
| `particulier.json` | Individual donor response with personal details |
| `entreprise.json` | Company donor response with SIREN and legal form |

### /payments/

Stripe payment intent API responses.

| File | Purpose |
|------|---------|
| `success-intent.json` | Successful payment intent creation |
| `declined-intent.json` | Declined card error response |

### /test-logo.png

1x1 pixel PNG image for testing logo uploads and display.

## Usage

Import fixtures in E2E tests using:

```typescript
import standardConfig from '../fixtures/klubr-configs/standard.json';
import projectsList from '../fixtures/projects/projects-list.json';
import particulierDonor from '../fixtures/donors/particulier.json';
import successIntent from '../fixtures/payments/success-intent.json';
```

Mock API endpoints with these fixtures:

```typescript
// Mock Strapi klubr-subscriptions/decrypt
cy.intercept('POST', '**/api/klubr-subscriptions/decrypt', standardConfig);

// Mock projects list endpoint
cy.intercept('GET', '**/api/klub-projets/byKlub/**', projectsList);

// Mock donor creation
cy.intercept('POST', '**/api/klubr-donateurs', particulierDonor);

// Mock payment intent
cy.intercept('POST', '**/api/klub-don-payments/create-payment-intent', successIntent);
```

## Fixture Structure

All fixtures follow the backend API response format:

```typescript
{
  data: { /* entity data */ },
  meta: { /* pagination or other metadata */ }
}
```

Or for decrypt endpoint (custom response):

```typescript
{
  klubr: { /* klubr entity */ },
  project: { /* project entity or null */ },
  allowProjectSelection: boolean,
  allowKlubrContribution: boolean
}
```

## Test UUIDs

Fixtures use stable UUIDs for testing:
- Klubr configs: `550e8400-e29b-41d4-a716-446655440001` to `...006`
- Trade policies: `550e8400-e29b-41d4-a716-446655440101` to `...106`
- Projects: `650e8400-e29b-41d4-a716-446655440101` to `...103`
- Donors: `750e8400-e29b-41d4-a716-446655440201` to `...202`

## Adding New Fixtures

When adding new fixtures:

1. Create file with descriptive name (kebab-case)
2. Follow existing JSON structure patterns
3. Use consistent UUID prefixes
4. Include all required fields from schema
5. Validate JSON: `python3 -m json.tool fixture.json`
6. Update this README with description
