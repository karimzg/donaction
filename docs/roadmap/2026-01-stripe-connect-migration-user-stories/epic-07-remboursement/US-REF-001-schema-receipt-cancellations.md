# US-REF-001 : Compléter le schéma `receipt_cancellations`

> **Epic**: 7 - Remboursement | **Priorité**: P2 | **Estimation**: 2 points

## 📋 Description

Enrichir le schéma receipt_cancellations pour gérer le workflow multi-étapes de remboursement avec validation.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Nouveaux champs disponibles
  Given le schéma receipt_cancellations
  When je consulte les attributs
  Then je trouve :
    | Champ                   | Type        | Description                    |
    | status                  | enum        | État du workflow               |
    | approved_by             | relation    | Admin qui a approuvé           |
    | approved_at             | datetime    | Date d'approbation             |
    | denied_by               | relation    | Admin qui a refusé             |
    | denied_at               | datetime    | Date de refus                  |
    | denial_reason           | text        | Motif du refus                 |
    | tax_authority_notified  | boolean     | Notification fisc envoyée      |
    | refund_id               | string      | ID refund Stripe               |
```

## 📐 Schéma

```json
{
  "attributes": {
    "status": {
      "type": "enumeration",
      "enum": [
        "awaiting_declaration",
        "pending_approval", 
        "approved",
        "denied",
        "refund_processing",
        "completed"
      ],
      "default": "awaiting_declaration"
    },
    "approved_by": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "admin::user"
    },
    "approved_at": { "type": "datetime" },
    "denied_by": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "admin::user"
    },
    "denied_at": { "type": "datetime" },
    "denial_reason": { "type": "text" },
    "tax_authority_notified": {
      "type": "boolean",
      "default": false
    },
    "refund_id": { "type": "string" }
  }
}
```

## ✅ Definition of Done

- [ ] Schéma mis à jour
- [ ] Migration générée
- [ ] Documentation
- [ ] PR approuvée et mergée
