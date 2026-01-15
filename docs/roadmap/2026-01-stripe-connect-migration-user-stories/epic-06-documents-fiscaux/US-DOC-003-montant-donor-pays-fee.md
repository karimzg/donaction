# US-DOC-003 : Calculer le montant du reçu selon `donorPaysFee`

> **Epic**: 6 - Documents Fiscaux | **Priorité**: P0 | **Estimation**: 2 points

## ⚠️ Condition de Garde

Ce calcul ne s'applique que si `stripe_connect === true`.

## 📋 Description

Le montant figurant sur le reçu fiscal doit correspondre exactement à ce que l'association reçoit.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Donor Pays Fee = TRUE
  Given don.donor_pays_fee = true
  And don.montant = 100
  When getReceiptAmount est appelé
  Then le montant retourné = 100 (100% du don)

Scenario: Donor Pays Fee = FALSE
  Given don.donor_pays_fee = false
  And don.montant = 100
  And commissionPercentage = 4
  When getReceiptAmount est appelé
  Then le montant retourné = 96 (100 - 4%)
```

## 📐 Implémentation

```typescript
function getReceiptAmount(don: KlubDonEntity, tradePolicy: TradePolicyEntity): number {
  // Condition de garde
  if (!tradePolicy.stripe_connect) {
    return don.montant; // Mode Legacy : montant brut
  }
  
  // Si Donor Pays Fee : le montant du reçu = montant intentionnel
  if (don.donor_pays_fee) {
    return don.montant;
  }
  
  // Si frais déduits : montant = ce que l'association reçoit vraiment
  const applicationFee = calculateApplicationFee(don.montant * 100, tradePolicy) / 100;
  return don.montant - applicationFee;
}
```

## ✅ Definition of Done

- [ ] Fonction getReceiptAmount créée
- [ ] Condition de garde implémentée
- [ ] Tests des 2 scénarios
- [ ] Intégration dans génération PDF
- [ ] PR approuvée et mergée
