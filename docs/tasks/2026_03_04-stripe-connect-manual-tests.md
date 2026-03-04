# Stripe Connect Migration - Manual API Tests

> Extracted from PRs #175, #176, #177, #178, and Issue #60 (US-PAY-004)
> Base URL: `http://localhost:1437/api`

## Prerequisites

```
1. Strapi running locally (npm run develop)
2. A JWT token (set as {{JWT}} variable in Postman)
3. Two klubrs available:
   - One with Stripe Connect (trade_policy.stripe_connect = true)  → {{KLUBR_SC_UUID}}
   - One Legacy (trade_policy.stripe_connect = false)              → {{KLUBR_LEGACY_UUID}}
4. A donor UUID                                                    → {{DONOR_UUID}}
5. Optionally a project UUID                                       → {{PROJECT_UUID}}
```

### Get JWT Token

```
POST {{BASE_URL}}/auth/local
Content-Type: application/json

{
  "identifier": "your-email@test.com",
  "password": "your-password"
}
```

Save `response.jwt` as `{{JWT}}`.

---

## 1. Verify Trade Policy Fee Config (PR #175)

### 1.1 Get Stripe Connect klubr's trade policy

```
GET {{BASE_URL}}/trade-policies?filters[klubr][uuid]={{KLUBR_SC_UUID}}&populate=*
Authorization: Bearer {{JWT}}
```

**Assert:**
- `stripe_connect` = `true`
- `stripe_fee_percentage` exists (default: `1.5`)
- `stripe_fee_fixed` exists (default: `0.25`)
- `fee_model` is one of: `percentage_only`, `fixed_only`, `percentage_plus_fixed`

### 1.2 Get Legacy klubr's trade policy

```
GET {{BASE_URL}}/trade-policies?filters[klubr][uuid]={{KLUBR_LEGACY_UUID}}&populate=*
Authorization: Bearer {{JWT}}
```

**Assert:**
- `stripe_connect` = `false`

### 1.3 Custom Stripe fees (PR #175)

Update trade policy with custom fees, then verify SaaS widget reads them:

```
PUT {{BASE_URL}}/trade-policies/{{TRADE_POLICY_DOC_ID}}
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "data": {
    "stripe_fee_percentage": 5,
    "stripe_fee_fixed": 1
  }
}
```

**Assert:** SaaS widget displays 5% + 1 EUR (not default 1.5% + 0.25 EUR).

---

## 2. donorPaysFee with Stripe Connect (PR #178)

### 2.1 Create donation on Stripe Connect klubr - donor pays fees

```
POST {{BASE_URL}}/klub-dons
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "data": {
    "montant": 50,
    "klubr": "{{KLUBR_SC_UUID}}",
    "klubDonateur": "{{DONOR_UUID}}",
    "donorPaysFee": true,
    "withTaxReduction": true
  },
  "formToken": "test-token"
}
```

**Assert:**
- Response `donorPaysFee` = `true` (donor's choice stored)
- `statusPaiment` = `"notDone"`

### 2.2 Create donation on Legacy klubr - donorPaysFee forced null

```
POST {{BASE_URL}}/klub-dons
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "data": {
    "montant": 50,
    "klubr": "{{KLUBR_LEGACY_UUID}}",
    "klubDonateur": "{{DONOR_UUID}}",
    "donorPaysFee": true,
    "withTaxReduction": true
  },
  "formToken": "test-token"
}
```

**Assert:**
- Response `donorPaysFee` = `null` (Legacy guard overrides donor's choice)

### 2.3 Update donation on Legacy klubr - donorPaysFee forced null

```
PUT {{BASE_URL}}/klub-dons/{{LEGACY_DON_UUID}}
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "data": {
    "donorPaysFee": true
  },
  "formToken": "test-token"
}
```

**Assert:**
- Response `donorPaysFee` = `null` (forced by Legacy guard on update too)

### 2.4 Existing donations unaffected

```
GET {{BASE_URL}}/klub-dons/{{EXISTING_DON_UUID}}
Authorization: Bearer {{JWT}}
```

**Assert:**
- `donorPaysFee` unchanged from before migration (no data migration happened)

---

## 3. Fee Calculation Verification (PR #175, #177)

### 3.1 Scenario A - Donor pays fees (Stripe Connect)

```
POST {{BASE_URL}}/klub-don-payments/create-payment-intent
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "price": 50,
  "metadata": {
    "donUuid": "{{DON_SC_UUID}}",
    "klubUuid": "{{KLUBR_SC_UUID}}"
  },
  "donorPaysFee": true
}
```

**Assert:**
- Returns `intent` (Stripe client_secret)
- Fee added on top of donation amount (total > 50 EUR)
- Platform commission = 4% of donation net

### 3.2 Scenario B - Fees deducted from donation (Stripe Connect)

```
POST {{BASE_URL}}/klub-don-payments/create-payment-intent
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "price": 50,
  "metadata": {
    "donUuid": "{{DON_SC_UUID}}",
    "klubUuid": "{{KLUBR_SC_UUID}}"
  },
  "donorPaysFee": false
}
```

**Assert:**
- Returns `intent`
- Donor charged exactly 50 EUR
- Association receives less (fees deducted)

### 3.3 Legacy mode - zero fees pass-through

```
POST {{BASE_URL}}/klub-don-payments/create-payment-intent
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "price": 50,
  "metadata": {
    "donUuid": "{{DON_LEGACY_UUID}}",
    "klubUuid": "{{KLUBR_LEGACY_UUID}}"
  }
}
```

**Assert:**
- No application fee calculated (Legacy mode)
- Standard Stripe payment intent created

### 3.4 Backward compat - clubs without custom fees use defaults

Use a klubr whose trade_policy has `stripe_fee_percentage = null` and `stripe_fee_fixed = null`.

**Assert:**
- Falls back to defaults: 1.5% + 0.25 EUR

### 3.5 Account not activated - blocked (Issue #60, Scenario 4)

Use a klubr with `stripe_connect = true` but `connected_account.charges_enabled = false`:

```
POST {{BASE_URL}}/klub-don-payments/create-payment-intent
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "price": 50,
  "metadata": {
    "donUuid": "{{DON_SC_UUID}}",
    "klubUuid": "{{KLUBR_SC_DISABLED_UUID}}"
  },
  "donorPaysFee": true
}
```

**Assert:**
- Returns 400 error
- Message contains "n'est pas encore activé"

### 3.6 Missing connected account (Issue #60)

Use a klubr with `stripe_connect = true` but no connected_account record:

**Assert:**
- Returns 400 error
- Message contains "pas de compte Stripe Connect configuré"

---

## 4. determineDonorPaysFee Logic (PR #176)

These are mostly covered by unit tests (54 pass), but verify end-to-end:

### 4.1 Project default overrides club default

Create donation on a project where `donor_pays_fee_project = false` but club has `donor_pays_fee = true`:

```
POST {{BASE_URL}}/klub-dons
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "data": {
    "montant": 30,
    "klubr": "{{KLUBR_SC_UUID}}",
    "klub_projet": "{{PROJECT_UUID}}",
    "klubDonateur": "{{DONOR_UUID}}",
    "withTaxReduction": true
  },
  "formToken": "test-token"
}
```

**Assert:**
- `donorPaysFee` reflects project-level default (not club default)

### 4.2 Donor choice override when allowed

When `allow_donor_fee_choice = true`, the donor's explicit choice should win:

```
POST {{BASE_URL}}/klub-dons
Authorization: Bearer {{JWT}}
Content-Type: application/json

{
  "data": {
    "montant": 30,
    "klubr": "{{KLUBR_SC_UUID}}",
    "klubDonateur": "{{DONOR_UUID}}",
    "donorPaysFee": false,
    "withTaxReduction": true
  },
  "formToken": "test-token"
}
```

**Assert:**
- `donorPaysFee` = `false` (donor's choice respected)

---

## 5. Payment Check Flow

After creating a payment intent, verify status:

```
GET {{BASE_URL}}/klub-don-payments/check?donUuid={{DON_UUID}}&clientSecret={{CLIENT_SECRET}}
Authorization: Bearer {{JWT}}
```

**Assert:**
- Returns current `statusPaiment`
- Payment record updated

---

## Summary Checklist

| #   | Test                                     | PR/Issue   | Status |
|-----|------------------------------------------|------------|--------|
| 1.1 | SC trade policy has stripe_fee fields    | #175       | [ ]    |
| 1.2 | Legacy trade policy works                | #175       | [ ]    |
| 1.3 | Custom stripe fees reflected in SaaS     | #175       | [ ]    |
| 2.1 | SC donation stores donorPaysFee=true     | #178       | [ ]    |
| 2.2 | Legacy donation forces donorPaysFee=null | #178       | [ ]    |
| 2.3 | Legacy update forces donorPaysFee=null   | #178       | [ ]    |
| 2.4 | Existing donations unaffected            | #178       | [ ]    |
| 3.1 | Scenario A: donor pays fees on top       | #175 #177  | [ ]    |
| 3.2 | Scenario B: fees deducted from donation  | #175 #177  | [ ]    |
| 3.3 | Legacy: zero fees pass-through           | #177       | [ ]    |
| 3.4 | Default fallback 1.5% + 0.25 EUR        | #175       | [ ]    |
| 3.5 | Account not activated blocked             | Issue #60  | [ ]    |
| 3.6 | Missing connected account blocked         | Issue #60  | [ ]    |
| 4.1 | Project default overrides club default   | #176       | [ ]    |
| 4.2 | Donor choice override when allowed       | #176       | [ ]    |
| 5   | Payment check flow                       | all        | [ ]    |
