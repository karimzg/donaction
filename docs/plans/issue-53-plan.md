# Implementation Plan: Issue #53

## Summary
Add a "Donor Pays Fee" radio choice component at step 3 of the donation form, allowing donors to choose whether they pay processing fees on top of their donation or have them deducted. This feature is gated by `stripe_connect` and `allow_donor_fee_choice` flags in the trade_policy, with default values depending on donation type (project vs club).

## Files to Modify

### Backend (Strapi API)
- `donaction-api/src/api/trade-policy/content-types/trade-policy/schema.json` - Add new fields: `stripe_connect`, `allow_donor_fee_choice`, `donor_pays_fee_club`, `donor_pays_fee_project`
- `donaction-api/src/api/klub-don/content-types/klub-don/schema.json` - Add `donorPaysFee` boolean field
- `donaction-api/src/api/klubr-subscription/controllers/klubr-subscription.ts` - Update `decrypt` to populate new trade_policy fields

### SaaS Widget (Svelte)
- `donaction-saas/src/components/sponsorshipForm/logic/useSponsorshipForm.svelte.ts` - Add `donorPaysFee` to DEFAULT_VALUES
- `donaction-saas/src/components/sponsorshipForm/components/formBody/steps/step3/step3.svelte` - Add radio component
- `donaction-saas/src/components/sponsorshipForm/components/formBody/steps/step3/index.scss` - Add radio styling
- `donaction-saas/src/components/sponsorshipForm/logic/submit.ts` - Include `donorPaysFee` in donation payload
- `donaction-saas/src/components/sponsorshipForm/logic/utils.ts` - Add fee calculation utility

## Implementation Steps

### Phase 1: Backend Schema Updates

**Step 1.1: Update trade-policy schema**
Verifie that these fields exists: `stripe_connect`, `allow_donor_fee_choice`, `donor_pays_fee_club`, `donor_pays_fee_project`

**Step 1.2: Update klub-don schema**
Add `donorPaysFee` boolean field

**Step 1.3: Update decrypt endpoint**
Include new trade_policy fields in populate

### Phase 2: Frontend State Management

**Step 2.1: Update useSponsorshipForm.svelte.ts**
Add `donorPaysFee` to `defVals` and `DEFAULT_VALUES`

**Step 2.2: Add fee calculation utility**
Create `calculateFeeAmount` and `calculateTotalWithFee` functions

**Step 2.3: Update initComponent.ts**
Set default `donorPaysFee` value based on trade_policy and donation type

### Phase 3: Radio Component Implementation

**Step 3.1: Create DonorFeeChoice section in step3.svelte**
- 2 radio options: "Je paie les frais en plus" / "J'intègre les frais au don"
- Show amount breakdown for each option
- Add a info icon after "Je paie les frais en plus" that open a Tooltip with ""

**Step 3.2: Add derived values for display**
- `shouldShowFeeChoice` - guard condition
- `commissionPercentage` - from trade_policy
- `feeAmount`, `totalWithFee`, `netAmount` - calculated values

**Step 3.3: Add a line in .recapList section**
- if stripe connect && donorsPaysFee, than add a line "Frais bancaire + frais de plateforme" with Fee+stripe fee amount"

**Step 3.4: Set default value based on donation type**
- PROJECT: default from `donor_pays_fee_project`
- CLUB: default from `donor_pays_fee_club`

### Phase 4: Styling

**Step 4.1: Add SCSS styles to index.scss**
Radio group styling with selected state

### Phase 5: Form Submission

**Step 5.1: Update submit.ts**
Include `donorPaysFee` in donation payload

### Phase 6: Payment Amount Calculation

**Step 6.1: Update step4.svelte payment amount**
Account for fee when `donorPaysFee = true`

## Testing Strategy

### E2E Tests
1. **Scenario 1: Display when authorized** - stripe_connect=true, allow_donor_fee_choice=true → radio visible
2. **Scenario 2: Default by donation type** - PROJECT=true default, CLUB=per setting
3. **Scenario 3: Legacy mode** - stripe_connect=false → no radio displayed

## Definition of Done
- [ ] Composant radio créé et stylisé
- [ ] Logique valeur par défaut implémentée
- [ ] Condition de garde vérifiée
- [ ] Tests E2E modes projet/club
- [ ] Test mode Legacy
- [ ] PR approuvée et mergée
