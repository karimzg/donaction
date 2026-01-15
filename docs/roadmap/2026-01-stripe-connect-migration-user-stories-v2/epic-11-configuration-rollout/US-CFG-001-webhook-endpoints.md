# US-CFG-001 : Configuration endpoints webhook

> **Epic**: 11 - Configuration | **Priorité**: P0 | **Estimation**: 2 points

## Dashboard Stripe

Configurer 2 endpoints :
1. **Account-level** : `/api/stripe/webhook` (événements standards)
2. **Connect** : `/api/stripe-connect/webhook` (événements comptes connectés)

## Événements Account-level
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

## Événements Connect
- `account.updated`
- `account.application.deauthorized`
- `payout.failed`
- `charge.dispute.*`
