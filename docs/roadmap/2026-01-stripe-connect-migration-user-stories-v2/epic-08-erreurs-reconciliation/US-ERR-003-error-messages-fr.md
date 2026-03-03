# US-ERR-003 : Messages d'erreur FR

> **Epic**: 8 - Erreurs | **Priorité**: P2 | **Estimation**: 5 points

Mapper les codes erreur Stripe en messages utilisateur-friendly en français.

```typescript
const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  'card_declined': 'Votre carte a été refusée. Essayez une autre carte.',
  'insufficient_funds': 'Fonds insuffisants sur votre carte.',
  'expired_card': 'Votre carte a expiré.',
  // ...
};
```
