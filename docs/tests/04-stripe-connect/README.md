# Tests Manuels - Stripe Connect Migration

> PRs #175, #176, #177, #178, Issue #60 (US-PAY-004)

## Setup

1. Lancer Strapi : `cd donaction-api && npm run develop`
2. Remplir les `REPLACE_ME` dans `http-client.env.json`
3. Dans WebStorm, sélectionner l'environnement **dev**

## Exécution

| Ordre | Fichier | Tests |
|-------|---------|-------|
| 1 | `00-auth.http` | Login, JWT sauvegardé automatiquement |
| 2 | `01-trade-policy.http` | Vérif fees SC/Legacy, update custom fees, restore |
| 3 | `02-donor-pays-fee.http` | donorPaysFee: SC=true, Legacy=null, update=null |
| 4 | `03-fee-calculation.http` | PaymentIntent: Scenario A/B, Legacy, fallback, account validation |
| 5 | `04-determine-donor-pays-fee.http` | Project default vs club, donor choice override |
| 6 | `05-payment-check.http` | Vérif statut paiement post-intent |

## Variables chainées

Les réponses alimentent automatiquement les requêtes suivantes :

- `00` -> `JWT` (utilisé partout)
- `01` -> `TRADE_POLICY_DOC_ID` (utilisé en 01.3)
- `02` -> `DON_SC_UUID`, `LEGACY_DON_UUID` (utilisés en 03, 05)
- `03` -> `CLIENT_SECRET_A` (utilisé en 05)

## Prérequis données

| Variable | Description |
|----------|-------------|
| `KLUBR_SC_UUID` | Klubr avec `trade_policy.stripe_connect = true` |
| `KLUBR_LEGACY_UUID` | Klubr avec `trade_policy.stripe_connect = false` |
| `KLUBR_SC_DISABLED_UUID` | Klubr avec `stripe_connect = true` mais `charges_enabled = false` |
| `DONOR_UUID` | UUID d'un klubr donateur existant |
| `PROJECT_UUID` | UUID d'un projet avec `donor_pays_fee_project = false` |
