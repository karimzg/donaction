# User Stories - Migration Stripe Connect DONACTION

> **Version**: 1.0.0 | **Date**: 2025-01-10 | **Epic**: 4 - Stripe Connect Migration

---

## 🎯 Objectif

Ce dossier contient les User Stories détaillées pour la migration de DONACTION vers Stripe Connect Express, permettant aux associations sportives françaises de recevoir les dons directement sur leurs comptes connectés.

## ⚠️ Condition de Garde Critique

**TOUTES les fonctionnalités Stripe Connect ne s'exécutent QUE si :**

```typescript
klubr.trade_policy.stripe_connect === true
```

Si `stripe_connect === false`, le système utilise le flux Legacy (Stripe Standard - compte unique Fond Klubr).

Cette condition s'applique aux EPICs :
- EPIC 2 : Formulaire Donateur
- EPIC 3 : Backend Paiement
- EPIC 5 : Onboarding Association
- EPIC 6 : Documents Fiscaux

---

## 📁 Structure des Dossiers

```
user-stories/
├── README.md (ce fichier)
├── epic-01-trade-policy/
│   ├── US-TP-001-migration-donor-pays-fee.md
│   ├── US-TP-002-commission-4-percent.md
│   └── US-TP-003-script-migration.md
├── epic-02-formulaire-donateur/
│   ├── US-FORM-001-choix-donor-pays-fee.md
│   ├── US-FORM-002-decomposition-frais.md
│   ├── US-FORM-003-flag-payment-intent.md
│   └── US-FORM-004-affichage-recu-fiscal.md
├── epic-03-backend-paiement/
│   ├── US-PAY-001-determine-donor-pays-fee.md
│   ├── US-PAY-002-fee-model-modes.md
│   ├── US-PAY-003-champ-klub-don.md
│   └── US-PAY-004-application-fee-amount.md
├── epic-04-webhooks-audit/
│   ├── US-WH-001-webhook-log-content-type.md
│   ├── US-WH-002-endpoint-connect-webhook.md
│   ├── US-WH-003-handler-account-updated.md
│   ├── US-WH-004-handler-deauthorized.md
│   ├── US-WH-005-handlers-disputes.md
│   └── US-WH-006-handler-payout-failed.md
├── epic-05-onboarding-association/
│   ├── US-ONB-001-manager-signature.md
│   ├── US-ONB-002-create-connected-account.md
│   ├── US-ONB-003-generate-onboarding-link.md
│   ├── US-ONB-004-can-accept-donations.md
│   ├── US-ONB-005-business-profile.md
│   ├── US-ONB-006-dashboard-onboarding.md
│   └── US-ONB-007-email-relance.md
├── epic-06-documents-fiscaux/
│   ├── US-DOC-001-recu-nom-association.md
│   ├── US-DOC-002-signature-responsable.md
│   ├── US-DOC-003-montant-donor-pays-fee.md
│   └── US-DOC-004-attestation-annulation.md
├── epic-07-remboursement/
│   ├── US-REF-001-schema-receipt-cancellations.md
│   ├── US-REF-002-workflow-multi-etapes.md
│   ├── US-REF-003-pdf-attestation-annulation.md
│   ├── US-REF-004-stripe-refunds-create.md
│   └── US-REF-005-dashboard-remboursements.md
├── epic-08-erreurs-reconciliation/
│   ├── US-ERR-001-retry-donateur.md
│   ├── US-ERR-002-cron-reconciliation.md
│   └── US-ERR-003-messages-erreur-fr.md
├── epic-09-reporting/
│   ├── US-REP-001-fee-statement-content-type.md
│   ├── US-REP-002-pdf-releve-frais.md
│   └── US-REP-003-email-releve.md
├── epic-10-disputes/
│   ├── US-DIS-001-champs-disputes-klub-don.md
│   ├── US-DIS-002-reverse-transfer.md
│   ├── US-DIS-003-dashboard-litiges.md
│   └── US-DIS-004-alertes-slack-discord.md
└── epic-11-configuration-rollout/
    ├── US-CFG-001-webhooks-stripe-dashboard.md
    ├── US-CFG-002-variables-environnement.md
    ├── US-CFG-003-feature-flag.md
    └── US-CFG-004-branding-stripe.md
```

---

## 📊 Résumé par Epic

| Epic | Nom | US | P0 | P1 | P2 | P3 |
|------|-----|----|----|----|----|----| 
| 1 | Trade Policy | 3 | 2 | 1 | 0 | 0 |
| 2 | Formulaire Donateur | 4 | 3 | 1 | 0 | 0 |
| 3 | Backend Paiement | 4 | 4 | 0 | 0 | 0 |
| 4 | Webhooks & Audit | 6 | 2 | 2 | 2 | 0 |
| 5 | Onboarding Association | 7 | 4 | 1 | 2 | 0 |
| 6 | Documents Fiscaux | 4 | 3 | 0 | 1 | 0 |
| 7 | Remboursement | 5 | 0 | 0 | 4 | 1 |
| 8 | Erreurs & Réconciliation | 3 | 0 | 2 | 1 | 0 |
| 9 | Reporting | 3 | 0 | 0 | 3 | 0 |
| 10 | Disputes | 4 | 0 | 1 | 3 | 0 |
| 11 | Configuration & Rollout | 4 | 2 | 1 | 1 | 0 |
| **Total** | | **47** | **20** | **9** | **17** | **1** |

---

## 🏷️ Légende des Priorités

| Priorité | Description | Délai |
|----------|-------------|-------|
| **P0** | Critique - Bloquant pour le lancement | Sprint 1-2 |
| **P1** | Important - Nécessaire avant rollout complet | Sprint 3-4 |
| **P2** | Amélioration - Post-lancement pilote | Sprint 5-6 |
| **P3** | Nice-to-have | Backlog |

---

## 🔗 Documents de Référence

- [Stratégie Collecte Dons Stripe Connect](../strategie-collecte-dons-donaction-stripe-connect.md)
- [Workflow Collecte Dons Existant](../workflow-collecte-dons-klubr.md)
- [CI/CD GitHub Actions](../donaction_cicd_github_actions_requirements_v3_final.md)

---

## ✅ Critères d'Acceptation Globaux

Chaque US doit respecter :

1. **Tests unitaires** : Coverage > 80%
2. **Tests d'intégration** : Scénarios Gherkin validés
3. **Documentation** : JSDoc/TSDoc sur les fonctions publiques
4. **Review** : PR approuvée par au moins 1 reviewer
5. **Condition de garde** : Vérification `stripe_connect === true` si applicable

---

> **Généré le** : 2025-01-10
> **Auteur** : Claude (Anthropic)
