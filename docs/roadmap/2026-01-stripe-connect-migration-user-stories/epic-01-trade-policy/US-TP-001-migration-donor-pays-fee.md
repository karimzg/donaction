# US-TP-001 : Migration champ `donor_pays_fee`

> **Epic**: 1 - Trade Policy | **Priorité**: P0 | **Estimation**: 3 points

---

## 📋 Description

**En tant que** développeur backend,
**Je veux** remplacer le champ unique `donor_pays_fee` par trois nouveaux champs distincts,
**Afin de** permettre une configuration différenciée entre les dons projet et les dons club, avec option de choix pour le donateur.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : Nouveaux champs présents dans le schéma

```gherkin
Given le schéma "trade_policy" dans Strapi
When je consulte les attributs disponibles
Then je trouve les champs suivants :
  | Champ                    | Type    | Default |
  | donor_pays_fee_project   | boolean | true    |
  | donor_pays_fee_club      | boolean | false   |
  | allow_donor_fee_choice   | boolean | true    |
And l'ancien champ "donor_pays_fee" est supprimé ou déprécié
```

### Scénario 2 : Valeurs par défaut correctes

```gherkin
Given une nouvelle trade_policy créée sans valeurs spécifiques
When je récupère cette trade_policy
Then donor_pays_fee_project = true
And donor_pays_fee_club = false
And allow_donor_fee_choice = true
```

### Scénario 3 : Rétrocompatibilité API

```gherkin
Given une requête API GET sur /api/trade-policies/:id
When la trade_policy existe
Then la réponse contient les 3 nouveaux champs
And aucune erreur n'est levée pour les anciens clients
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
    // SUPPRIMER ou DÉPRÉCIER
    // "donor_pays_fee": {
    //   "type": "boolean",
    //   "default": false
    // },

    // AJOUTER
    "donor_pays_fee_project": {
      "type": "boolean",
      "default": true,
      "required": false
    },
    "donor_pays_fee_club": {
      "type": "boolean",
      "default": false,
      "required": false
    },
    "allow_donor_fee_choice": {
      "type": "boolean",
      "default": true,
      "required": false
    }
  }
}
```

### Impact sur l'interface Admin Strapi

- Grouper ces 3 champs dans une section "Stripe Connect - Gestion des frais"
- Ajouter des descriptions explicatives pour chaque champ

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Bloque | US-TP-003 | Script de migration |
| Bloque | US-FORM-001 | Choix donor pays fee formulaire |
| Bloque | US-PAY-001 | Logique determineDonorPaysFee |

---

## ✅ Definition of Done

- [ ] Schéma JSON modifié et validé
- [ ] Migration de base de données générée (`npm run strapi migration:generate`)
- [ ] Tests unitaires sur les valeurs par défaut
- [ ] Documentation API mise à jour
- [ ] PR approuvée et mergée

---

## 📝 Notes

- L'ancien champ `donor_pays_fee` peut être conservé temporairement avec une annotation `@deprecated` pour la rétrocompatibilité
- Prévoir un lifecycle hook pour synchroniser l'ancien champ si des clients legacy l'utilisent encore
