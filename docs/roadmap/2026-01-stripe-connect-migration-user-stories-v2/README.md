# User Stories - Migration Stripe Connect DONACTION

> **Version**: 2.0.0 | **Date**: 2026-01-11 | **Total US**: 47

## 📋 Vue d'ensemble

Ce package contient les User Stories pour la migration de DONACTION vers Stripe Connect Express.

### ⚠️ Règle critique : Condition de garde

**Toute fonctionnalité Stripe Connect doit être protégée par :**

```typescript
if (klubr.trade_policy.stripe_connect === true) {
  // Code Stripe Connect
} else {
  // Code Legacy (Stripe Standard)
}
```

## 📊 Répartition par Epic

| Epic | Nom | US | Points | Priorité dominante |
|------|-----|-----|--------|-------------------|
| 1 | Trade Policy | 3 | 8 | P0 |
| 2 | Formulaire Donateur ⚠️ | 4 | 13 | P0 |
| 3 | Backend Paiement ⚠️ | 4 | 21 | P0 |
| 4 | Webhooks & Audit | 6 | 18 | P0-P2 |
| 5 | Onboarding Association ⚠️ | 7 | 26 | P0-P2 |
| 6 | Documents Fiscaux ⚠️ | 4 | 13 | P0-P2 |
| 7 | Remboursement | 5 | 18 | P2 |
| 8 | Erreurs & Réconciliation | 3 | 13 | P1-P2 |
| 9 | Reporting | 3 | 13 | P2 |
| 10 | Disputes | 4 | 13 | P1-P2 |
| 11 | Configuration & Rollout | 4 | 8 | P0-P2 |
| **Total** | | **47** | **164** | |

⚠️ = Épics avec condition de garde `stripe_connect === true`

## 🔑 Changement majeur v2.0.0 : Calcul des frais Scénario B

### Problème identifié

Avec Stripe Connect en mode **Destination Charges**, les frais Stripe sont déduits du solde de la **plateforme** (DONACTION), pas du compte connecté.

Avec l'ancienne formule (`application_fee = 4%` seulement) :
- DONACTION ne recevait que ~2.25% net après déduction des frais Stripe

### Solution implémentée

L'`application_fee_amount` inclut désormais les frais Stripe estimés :

```typescript
// Scénario B : Donor Pays Fee = FALSE
const commissionDonaction = montantDon * 0.04;  // 4%
const fraisStripeEstimes = (totalPreleve * 0.015) + 0.25;  // ~1.75%
const applicationFee = commissionDonaction + fraisStripeEstimes;
```

| Don | Commission 4% | Frais Stripe | application_fee | Net DONACTION | Association reçoit |
|-----|--------------|--------------|-----------------|---------------|-------------------|
| 100€ | 4.00€ | 1.90€ | 5.90€ | **4.00€** ✅ | 94.10€ |

## 📁 Structure des fichiers

```
user-stories/
├── README.md
├── epic-01-trade-policy/
│   ├── US-TP-001-schema-evolution.md
│   ├── US-TP-002-donor-pays-fee-fields.md
│   └── US-TP-003-migration-script.md
├── epic-02-formulaire-donateur/
│   ├── US-FORM-001-fee-choice-ui.md
│   ├── US-FORM-002-amount-calculation.md
│   ├── US-FORM-003-association-display.md
│   └── US-FORM-004-fee-transparency.md
├── epic-03-backend-paiement/
│   ├── US-PAY-001-determine-donor-pays-fee.md
│   ├── US-PAY-002-fee-model-calculation.md
│   ├── US-PAY-003-donor-pays-fee-field.md
│   └── US-PAY-004-payment-intent-creation.md
├── epic-04-webhooks-audit/
│   └── ... (6 US)
├── epic-05-onboarding-association/
│   └── ... (7 US)
├── epic-06-documents-fiscaux/
│   └── ... (4 US)
├── epic-07-remboursement/
│   └── ... (5 US)
├── epic-08-erreurs-reconciliation/
│   └── ... (3 US)
├── epic-09-reporting/
│   └── ... (3 US)
├── epic-10-disputes/
│   └── ... (4 US)
└── epic-11-configuration-rollout/
    └── ... (4 US)
```

## 🚀 Ordre d'implémentation recommandé

### Phase 1 - Foundation (Sprint 1-2)
1. **Epic 1** : Trade Policy schema
2. **Epic 11** : Configuration Stripe (webhooks, secrets)
3. **Epic 5** : Onboarding Association (comptes connectés)

### Phase 2 - Core Payment Flow (Sprint 3-4)
4. **Epic 3** : Backend Paiement
5. **Epic 2** : Formulaire Donateur
6. **Epic 4** : Webhooks & Audit

### Phase 3 - Documents & Compliance (Sprint 5)
7. **Epic 6** : Documents Fiscaux

### Phase 4 - Edge Cases (Sprint 6-7)
8. **Epic 7** : Remboursement
9. **Epic 8** : Erreurs & Réconciliation
10. **Epic 10** : Disputes
11. **Epic 9** : Reporting

## 📝 Conventions

- **Gherkin** : Tous les critères d'acceptation utilisent le format Gherkin
- **Condition de garde** : Chaque US concernée inclut le bloc de vérification `stripe_connect === true`
- **Definition of Done** : Checklist standard pour chaque US
- **Estimation** : Points Fibonacci (1, 2, 3, 5, 8, 13)
