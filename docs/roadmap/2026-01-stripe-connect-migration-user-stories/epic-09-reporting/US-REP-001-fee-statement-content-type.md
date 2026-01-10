# US-REP-001 : Créer le content-type `fee-statement`

> **Epic**: 9 - Reporting | **Priorité**: P2 | **Estimation**: 2 points

## 📋 Description

Créer un content-type pour stocker les relevés mensuels de frais par association.

## 🎯 Schéma

```json
{
  "kind": "collectionType",
  "collectionName": "fee_statements",
  "info": {
    "singularName": "fee-statement",
    "pluralName": "fee-statements",
    "displayName": "Fee Statement"
  },
  "attributes": {
    "klubr": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::klubr.klubr"
    },
    "period_start": { "type": "date", "required": true },
    "period_end": { "type": "date", "required": true },
    "total_donations": { "type": "decimal", "required": true },
    "total_fees": { "type": "decimal", "required": true },
    "donation_count": { "type": "integer", "required": true },
    "currency": { "type": "string", "default": "EUR" },
    "pdf_file": {
      "type": "media",
      "allowedTypes": ["files"]
    },
    "sent_at": { "type": "datetime" },
    "status": {
      "type": "enumeration",
      "enum": ["draft", "generated", "sent"],
      "default": "draft"
    }
  }
}
```

## ✅ Definition of Done

- [ ] Content-type créé
- [ ] Relation avec klubr
- [ ] Migration générée
- [ ] PR approuvée et mergée
