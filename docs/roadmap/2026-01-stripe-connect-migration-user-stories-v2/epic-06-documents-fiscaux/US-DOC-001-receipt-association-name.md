# US-DOC-001 : Reçu fiscal au nom de l'association

> **Epic**: 6 - Documents Fiscaux | **Priorité**: P0 | **Estimation**: 5 points

## ⚠️ Condition de Garde

```typescript
if (klubr.trade_policy.stripe_connect === true) {
  // Émetteur = Association
} else {
  // Émetteur = DONACTION (Legacy)
}
```

## 📋 Description

Le reçu fiscal doit être émis au nom de l'association bénéficiaire.

## Changements

| Champ | Legacy | Stripe Connect |
|-------|--------|----------------|
| Émetteur | DONACTION | Nom de l'association |
| SIREN | DONACTION | SIREN de l'association |
| Adresse | DONACTION | Adresse de l'association |
| Signature | DONACTION | Responsable de l'association |
