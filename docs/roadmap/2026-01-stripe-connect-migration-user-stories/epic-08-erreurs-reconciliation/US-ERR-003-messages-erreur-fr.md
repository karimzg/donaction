# US-ERR-003 : Mapper les codes erreur Stripe en messages FR

> **Epic**: 8 - Erreurs & Réconciliation | **Priorité**: P2 | **Estimation**: 2 points

## 📋 Description

Créer un dictionnaire de traduction des codes d'erreur Stripe pour afficher des messages clairs aux donateurs français.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Carte déclinée
  Given une erreur Stripe "card_declined"
  When getErrorMessage est appelé
  Then le message = "Votre carte a été refusée. Veuillez réessayer ou utiliser une autre carte."

Scenario: Code inconnu
  Given un code erreur non répertorié
  When getErrorMessage est appelé
  Then le message = "Une erreur est survenue. Veuillez réessayer."
```

## 📐 Dictionnaire

```typescript
// helpers/stripe-error-messages.ts
export const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  card_declined: 'Votre carte a été refusée. Veuillez réessayer ou utiliser une autre carte.',
  insufficient_funds: 'Fonds insuffisants sur votre carte.',
  expired_card: 'Votre carte est expirée. Veuillez utiliser une autre carte.',
  incorrect_cvc: 'Le code de sécurité (CVC) est incorrect.',
  processing_error: 'Erreur de traitement. Veuillez réessayer dans quelques instants.',
  incorrect_number: 'Le numéro de carte est incorrect.',
  invalid_expiry_month: 'Le mois d\'expiration est invalide.',
  invalid_expiry_year: 'L\'année d\'expiration est invalide.',
  authentication_required: 'Authentification requise. Veuillez valider sur l\'application de votre banque.',
  payment_intent_authentication_failure: 'L\'authentification a échoué. Veuillez réessayer.',
};

export function getStripeErrorMessage(code: string): string {
  return STRIPE_ERROR_MESSAGES[code] || 'Une erreur est survenue. Veuillez réessayer.';
}
```

## ✅ Definition of Done

- [ ] Dictionnaire créé avec 15+ codes
- [ ] Fonction helper exportée
- [ ] Intégration frontend widget
- [ ] Tests
- [ ] PR approuvée et mergée
