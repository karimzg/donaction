# US-PAY-002 : Implémenter les 3 modes de `fee_model`

> **Epic**: 3 - Backend Paiement | **Priorité**: P0 | **Estimation**: 2 points

---

## ⚠️ Condition de Garde

```typescript
// Cette fonctionnalité ne s'active QUE si :
klubr.trade_policy.stripe_connect === true
```

---

## 📋 Description

**En tant que** administrateur plateforme,
**Je veux** pouvoir configurer différents modes de calcul des frais,
**Afin de** proposer des offres commerciales flexibles aux associations.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : Mode percentage_only (défaut)

```gherkin
Given trade_policy.stripe_connect = true
And trade_policy.fee_model = "percentage_only"
And trade_policy.commissionPercentage = 4
And un don de 100€
When l'application_fee est calculé
Then application_fee = 4€ (400 centimes)
```

### Scénario 2 : Mode fixed_only

```gherkin
Given trade_policy.stripe_connect = true
And trade_policy.fee_model = "fixed_only"
And trade_policy.fixed_amount = 2.50
And un don de 100€
When l'application_fee est calculé
Then application_fee = 2.50€ (250 centimes)
And le pourcentage n'est pas utilisé
```

### Scénario 3 : Mode percentage_plus_fixed

```gherkin
Given trade_policy.stripe_connect = true
And trade_policy.fee_model = "percentage_plus_fixed"
And trade_policy.commissionPercentage = 3
And trade_policy.fixed_amount = 0.50
And un don de 100€
When l'application_fee est calculé
Then application_fee = 3€ + 0.50€ = 3.50€ (350 centimes)
```

### Scénario 4 : Valeur par défaut si fee_model manquant

```gherkin
Given trade_policy.stripe_connect = true
And trade_policy.fee_model = null
And trade_policy.commissionPercentage = 4
When l'application_fee est calculé
Then le mode "percentage_only" est utilisé par défaut
```

---

## 📐 Spécifications Techniques

### Fichier à modifier

```
donaction-api/src/api/trade-policy/content-types/trade-policy/schema.json
```

### Évolution du schéma

```json
{
  "attributes": {
    "fee_model": {
      "type": "enumeration",
      "enum": ["percentage_only", "fixed_only", "percentage_plus_fixed"],
      "default": "percentage_only",
      "required": false
    },
    "fixed_amount": {
      "type": "decimal",
      "default": 0,
      "min": 0,
      "required": false
    }
  }
}
```

### Implémentation dans le helper

```typescript
// fee-calculation-helper.ts (extension de US-PAY-001)

export type FeeModel = 'percentage_only' | 'fixed_only' | 'percentage_plus_fixed';

export function calculateApplicationFee(
  amountInCents: number,
  tradePolicy: {
    stripe_connect: boolean;
    fee_model?: FeeModel;
    commissionPercentage?: number;
    fixed_amount?: number;
  }
): number {
  if (!tradePolicy.stripe_connect) {
    throw new Error('stripe_connect must be true');
  }
  
  const feeModel: FeeModel = tradePolicy.fee_model ?? 'percentage_only';
  const commissionPercentage = tradePolicy.commissionPercentage ?? 4;
  const fixedAmountCents = Math.round((tradePolicy.fixed_amount ?? 0) * 100);
  
  switch (feeModel) {
    case 'percentage_only':
      return Math.round(amountInCents * (commissionPercentage / 100));
      
    case 'fixed_only':
      return fixedAmountCents;
      
    case 'percentage_plus_fixed':
      return Math.round(amountInCents * (commissionPercentage / 100)) + fixedAmountCents;
      
    default:
      // Fallback sécurisé
      return Math.round(amountInCents * (commissionPercentage / 100));
  }
}
```

### Exemples de configuration

| Association | fee_model | commissionPercentage | fixed_amount | Don 50€ | Don 200€ |
|-------------|-----------|---------------------|--------------|---------|----------|
| Standard | percentage_only | 4% | - | 2€ | 8€ |
| Partenaire | percentage_only | 2% | - | 1€ | 4€ |
| Volume élevé | fixed_only | - | 1€ | 1€ | 1€ |
| Hybride | percentage_plus_fixed | 2% | 0.30€ | 1.30€ | 4.30€ |

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Inclus dans | US-PAY-001 | Même helper |
| Bloque | US-PAY-004 | Calcul application_fee |

---

## ✅ Definition of Done

- [ ] Champ `fee_model` ajouté au schéma
- [ ] Champ `fixed_amount` ajouté au schéma
- [ ] Tests unitaires pour chaque mode
- [ ] Documentation des modes dans le README
- [ ] PR approuvée et mergée

---

## 📝 Notes

- Le mode `fixed_only` est utile pour les associations à fort volume
- Prévoir une validation : si `fixed_only`, `fixed_amount` doit être > 0
- Le calcul arrondit toujours au centime supérieur
