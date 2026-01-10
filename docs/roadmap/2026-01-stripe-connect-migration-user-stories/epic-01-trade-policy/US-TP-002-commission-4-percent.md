# US-TP-002 : Modifier `commissionPercentage` default de 6% à 4%

> **Epic**: 1 - Trade Policy | **Priorité**: P0 | **Estimation**: 1 point

---

## 📋 Description

**En tant que** product owner,
**Je veux** que la commission par défaut passe de 6% à 4%,
**Afin de** refléter le nouveau modèle économique Stripe Connect où les frais sont transparents pour le donateur.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : Nouvelle valeur par défaut

```gherkin
Given le schéma "trade_policy" dans Strapi
When une nouvelle trade_policy est créée sans spécifier commissionPercentage
Then commissionPercentage = 4
```

### Scénario 2 : Trade policies existantes non impactées

```gherkin
Given une trade_policy existante avec commissionPercentage = 6
When je la récupère après le déploiement
Then commissionPercentage = 6 (inchangé)
```

### Scénario 3 : Cohérence avec stripe_connect

```gherkin
Given une trade_policy avec stripe_connect = true
When le système calcule l'application_fee_amount
Then il utilise la valeur de commissionPercentage (4% par défaut)
```

---

## 📐 Spécifications Techniques

### Fichier à modifier

```
donaction-api/src/api/trade-policy/content-types/trade-policy/schema.json
```

### Modification

```json
{
  "attributes": {
    "commissionPercentage": {
      "type": "decimal",
      "default": 4,  // Était 6
      "min": 0,
      "max": 100
    }
  }
}
```

### Note importante

Cette modification ne change que la valeur **par défaut** pour les nouvelles trade policies. Les trade policies existantes conservent leur valeur actuelle.

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Aucune | - | Modification isolée |

---

## ✅ Definition of Done

- [ ] Valeur default modifiée dans le schéma
- [ ] Test de non-régression sur les trade policies existantes
- [ ] Documentation mise à jour (README, API docs)
- [ ] PR approuvée et mergée

---

## 📝 Notes

- La valeur de 6% reste valide pour le mode Legacy (`stripe_connect = false`)
- Prévoir une note dans le changelog pour informer les utilisateurs
