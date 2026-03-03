# US-PAY-003 : Ajouter le champ `donor_pays_fee` au schéma `klub-don`

> **Epic**: 3 - Backend Paiement | **Priorité**: P0 | **Estimation**: 1 point

---

## ⚠️ Condition de Garde

Ce champ est utilisé uniquement quand `stripe_connect === true`. En mode Legacy, il reste `null`.

---

## 📋 Description

**En tant que** système backend,
**Je veux** stocker le choix du donateur concernant les frais dans chaque don,
**Afin de** pouvoir recalculer les montants et générer les documents corrects.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : Stockage du choix donateur

```gherkin
Given un don créé avec Stripe Connect
And le donateur a choisi donorPaysFee = true
When le don est enregistré
Then klub_don.donor_pays_fee = true
```

### Scénario 2 : Valeur null en mode Legacy

```gherkin
Given un don créé en mode Legacy (stripe_connect = false)
When le don est enregistré
Then klub_don.donor_pays_fee = null
```

### Scénario 3 : Requête API inclut le champ

```gherkin
Given un don existant avec donor_pays_fee = false
When je fais GET /api/klub-dons/:id
Then la réponse contient "donor_pays_fee": false
```

---

## 📐 Spécifications Techniques

### Fichier à modifier

```
donaction-api/src/api/klub-don/content-types/klub-don/schema.json
```

### Évolution du schéma

```json
{
  "attributes": {
    "donor_pays_fee": {
      "type": "boolean",
      "required": false,
      "default": null
    }
  }
}
```

### Lifecycle hook pour le stockage

```typescript
// klub-don/lifecycles.ts

export default {
  async beforeCreate(event) {
    const { data } = event.params;
    
    // Récupérer le klubr pour vérifier stripe_connect
    if (data.klubr) {
      const klubr = await strapi.documents('api::klubr.klubr').findOne({
        documentId: data.klubr,
        populate: ['trade_policy'],
      });
      
      // Si pas Stripe Connect, forcer donor_pays_fee à null
      if (!klubr?.trade_policy?.stripe_connect) {
        data.donor_pays_fee = null;
      }
    }
  },
};
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-TP-001 | Champ stripe_connect |
| Bloque | US-DOC-003 | Calcul montant reçu fiscal |

---

## ✅ Definition of Done

- [ ] Champ `donor_pays_fee` ajouté au schéma
- [ ] Migration de base générée
- [ ] Lifecycle hook pour le mode Legacy
- [ ] Tests d'intégration API
- [ ] PR approuvée et mergée

---

## 📝 Notes

- Le champ est nullable pour la rétrocompatibilité
- Les dons existants conservent `null` (pas de migration de données)
- Prévoir un index sur ce champ pour les requêtes de reporting
